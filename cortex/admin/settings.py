"""Settings management for AI provider API keys and model configurations."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from pydantic import BaseModel, Field
from datetime import datetime
import structlog

from cortex.database.connection import get_db
from cortex.database.models import Base
from cortex.middleware.auth import require_admin
from sqlalchemy import Column, String, Text, DateTime, Boolean
import json
from cryptography.fernet import Fernet
import os

logger = structlog.get_logger()

router = APIRouter(prefix="/settings", tags=["settings"])


# Database Model for Provider Settings
class ProviderSetting(Base):
    """Store AI provider API keys and configurations."""
    __tablename__ = "provider_settings"
    
    provider_name = Column(String(50), primary_key=True)  # openai, groq, deepseek, etc.
    api_key_encrypted = Column(Text, nullable=False)
    model_config = Column(Text, nullable=True)  # JSON string of model configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Encryption key (in production, store this securely)
def get_encryption_key():
    """Get or create encryption key for API keys."""
    key_file = ".encryption_key"
    if os.path.exists(key_file):
        with open(key_file, "rb") as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        with open(key_file, "wb") as f:
            f.write(key)
        return key


ENCRYPTION_KEY = get_encryption_key()
cipher = Fernet(ENCRYPTION_KEY)


def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key."""
    return cipher.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an API key."""
    return cipher.decrypt(encrypted_key.encode()).decode()


# Request/Response Models
class ProviderSettingCreate(BaseModel):
    provider_name: str = Field(..., description="Provider name (openai, groq, deepseek, anthropic)")
    api_key: str = Field(..., description="API key for the provider")
    provider_config: Optional[Dict[str, Any]] = Field(default=None, description="Model configuration")
    is_active: bool = Field(default=True, description="Whether the provider is active")


class ProviderSettingUpdate(BaseModel):
    api_key: Optional[str] = Field(default=None, description="New API key")
    provider_config: Optional[Dict[str, Any]] = Field(default=None, description="Updated model configuration")
    is_active: Optional[bool] = Field(default=None, description="Active status")


class ProviderSettingResponse(BaseModel):
    provider_name: str
    api_key_preview: str  # Only show last 4 characters
    provider_config: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


@router.post("/providers", response_model=ProviderSettingResponse)
async def create_provider_setting(
    setting: ProviderSettingCreate,
    _: None = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Create or update a provider setting with encrypted API key.
    """
    # Check if provider already exists
    result = await db.execute(
        select(ProviderSetting).where(ProviderSetting.provider_name == setting.provider_name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Provider '{setting.provider_name}' already exists. Use PUT to update."
        )
    
    # Encrypt API key
    encrypted_key = encrypt_api_key(setting.api_key)
    
    # Create new provider setting
    new_setting = ProviderSetting(
        provider_name=setting.provider_name,
        api_key_encrypted=encrypted_key,
        model_config=json.dumps(setting.provider_config) if setting.provider_config else None,
        is_active=setting.is_active
    )
    
    db.add(new_setting)
    await db.commit()
    await db.refresh(new_setting)
    
    logger.info("provider_setting_created", provider=setting.provider_name)
    
    return ProviderSettingResponse(
        provider_name=new_setting.provider_name,
        api_key_preview=f"...{setting.api_key[-4:]}" if len(setting.api_key) >= 4 else "****",
        provider_config=json.loads(new_setting.model_config) if new_setting.model_config else None,
        is_active=new_setting.is_active,
        created_at=new_setting.created_at,
        updated_at=new_setting.updated_at
    )


@router.get("/providers", response_model=List[ProviderSettingResponse])
async def list_provider_settings(
    _: None = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    List all provider settings (API keys are masked).
    """
    result = await db.execute(select(ProviderSetting))
    settings = result.scalars().all()
    
    response = []
    for setting in settings:
        # Decrypt just to get preview
        try:
            decrypted = decrypt_api_key(setting.api_key_encrypted)
            preview = f"...{decrypted[-4:]}" if len(decrypted) >= 4 else "****"
        except:
            preview = "****"
        
        response.append(ProviderSettingResponse(
            provider_name=setting.provider_name,
            api_key_preview=preview,
            provider_config=json.loads(setting.model_config) if setting.model_config else None,
            is_active=setting.is_active,
            created_at=setting.created_at,
            updated_at=setting.updated_at
        ))
    
    return response


@router.get("/providers/{provider_name}", response_model=ProviderSettingResponse)
async def get_provider_setting(
    provider_name: str,
    _: None = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific provider setting.
    """
    result = await db.execute(
        select(ProviderSetting).where(ProviderSetting.provider_name == provider_name)
    )
    setting = result.scalar_one_or_none()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider_name}' not found"
        )
    
    # Decrypt for preview
    try:
        decrypted = decrypt_api_key(setting.api_key_encrypted)
        preview = f"...{decrypted[-4:]}" if len(decrypted) >= 4 else "****"
    except:
        preview = "****"
    
    return ProviderSettingResponse(
        provider_name=setting.provider_name,
        api_key_preview=preview,
        provider_config=json.loads(setting.model_config) if setting.model_config else None,
        is_active=setting.is_active,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )


@router.put("/providers/{provider_name}", response_model=ProviderSettingResponse)
async def update_provider_setting(
    provider_name: str,
    update_data: ProviderSettingUpdate,
    _: None = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a provider setting.
    """
    result = await db.execute(
        select(ProviderSetting).where(ProviderSetting.provider_name == provider_name)
    )
    setting = result.scalar_one_or_none()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider_name}' not found"
        )
    
    # Update fields
    if update_data.api_key is not None:
        setting.api_key_encrypted = encrypt_api_key(update_data.api_key)
    
    if update_data.provider_config is not None:
        setting.model_config = json.dumps(update_data.provider_config)
    
    if update_data.is_active is not None:
        setting.is_active = update_data.is_active
    
    setting.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(setting)
    
    logger.info("provider_setting_updated", provider=provider_name)
    
    # Get preview
    try:
        decrypted = decrypt_api_key(setting.api_key_encrypted)
        preview = f"...{decrypted[-4:]}" if len(decrypted) >= 4 else "****"
    except:
        preview = "****"
    
    return ProviderSettingResponse(
        provider_name=setting.provider_name,
        api_key_preview=preview,
        provider_config=json.loads(setting.model_config) if setting.model_config else None,
        is_active=setting.is_active,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )


@router.delete("/providers/{provider_name}")
async def delete_provider_setting(
    provider_name: str,
    _: None = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a provider setting.
    """
    result = await db.execute(
        select(ProviderSetting).where(ProviderSetting.provider_name == provider_name)
    )
    setting = result.scalar_one_or_none()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider_name}' not found"
        )
    
    await db.delete(setting)
    await db.commit()
    
    logger.info("provider_setting_deleted", provider=provider_name)
    
    return {"message": f"Provider '{provider_name}' deleted successfully"}


@router.get("/providers/{provider_name}/api-key")
async def get_decrypted_api_key(
    provider_name: str,
    _: None = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the decrypted API key for a provider (use with caution).
    This endpoint should only be called by the backend, not exposed to frontend.
    """
    result = await db.execute(
        select(ProviderSetting).where(ProviderSetting.provider_name == provider_name)
    )
    setting = result.scalar_one_or_none()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider_name}' not found"
        )
    
    if not setting.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider '{provider_name}' is not active"
        )
    
    try:
        decrypted_key = decrypt_api_key(setting.api_key_encrypted)
        return {"api_key": decrypted_key}
    except Exception as e:
        logger.error("failed_to_decrypt_api_key", provider=provider_name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt API key"
        )
