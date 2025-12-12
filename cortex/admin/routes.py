"""Admin API routes."""

from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
import structlog

from cortex.database.connection import get_db
from cortex.admin.key_service import APIKeyService
from cortex.middleware.auth import require_admin
from cortex.admin import analytics, settings

logger = structlog.get_logger()

router = APIRouter(prefix="/admin/v1", tags=["admin"])

# Include analytics routes
router.include_router(analytics.router, prefix="", tags=["analytics"])

# Include settings routes
router.include_router(settings.router, prefix="", tags=["settings"])


# Request/Response Models
class CreateKeyRequest(BaseModel):
    """Request to create a new API key."""
    name: str = Field(..., description="Human-readable name for the key")
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    expires_in_days: Optional[int] = Field(None, description="Optional expiration in days", gt=0)
    metadata: Optional[dict] = Field(None, description="Optional metadata")


class APIKeyResponse(BaseModel):
    """API key information (without the actual key)."""
    id: int
    name: str
    key_prefix: str
    user_id: Optional[str]
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    metadata: Optional[dict]


class CreateKeyResponse(BaseModel):
    """Response when creating a new key."""
    key: str = Field(..., description="The actual API key (only shown once)")
    key_info: APIKeyResponse


class RevokeKeyRequest(BaseModel):
    """Request to revoke an API key."""
    key_id: int = Field(..., description="ID of the key to revoke")


class ModelInfo(BaseModel):
    """Information about an available model."""
    model_name: str
    provider: str
    mode: str
    supports_function_calling: bool
    fallbacks: List[str]


# Endpoints
@router.post("/generate_key", response_model=CreateKeyResponse)
async def generate_key(
    request: CreateKeyRequest,
    db: AsyncSession = Depends(get_db),
    _admin: bool = Depends(require_admin)
):
    """
    Generate a new API key.
    
    Requires admin authentication.
    
    Returns the key only once - it cannot be retrieved later.
    """
    try:
        api_key, plaintext_key = await APIKeyService.create_key(
            db=db,
            name=request.name,
            user_id=request.user_id,
            expires_in_days=request.expires_in_days,
            metadata=request.metadata
        )
        
        return CreateKeyResponse(
            key=plaintext_key,
            key_info=APIKeyResponse(
                id=api_key.id,
                name=api_key.name,
                key_prefix=api_key.key_prefix,
                user_id=api_key.user_id,
                is_active=api_key.is_active,
                created_at=api_key.created_at,
                last_used_at=api_key.last_used_at,
                expires_at=api_key.expires_at,
                metadata=api_key.key_metadata
            )
        )
    
    except Exception as e:
        logger.error("key_generation_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate API key"
        )


@router.post("/revoke_key")
async def revoke_key(
    request: RevokeKeyRequest,
    db: AsyncSession = Depends(get_db),
    _admin: bool = Depends(require_admin)
):
    """
    Revoke an API key.
    
    Requires admin authentication.
    """
    success = await APIKeyService.revoke_key(db, request.key_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key with ID {request.key_id} not found"
        )
    
    return {"success": True, "message": f"API key {request.key_id} revoked"}


@router.get("/keys", response_model=List[APIKeyResponse])
async def list_keys(
    user_id: Optional[str] = None,
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    _admin: bool = Depends(require_admin)
):
    """
    List API keys.
    
    Requires admin authentication.
    
    Query parameters:
    - user_id: Filter by user ID
    - include_inactive: Include revoked/expired keys
    """
    keys = await APIKeyService.list_keys(
        db=db,
        user_id=user_id,
        include_inactive=include_inactive
    )
    
    return [
        APIKeyResponse(
            id=key.id,
            name=key.name,
            key_prefix=key.key_prefix,
            user_id=key.user_id,
            is_active=key.is_active,
            created_at=key.created_at,
            last_used_at=key.last_used_at,
            expires_at=key.expires_at,
            metadata=key.key_metadata
        )
        for key in keys
    ]


@router.get("/models", response_model=List[ModelInfo])
async def list_models(_admin: bool = Depends(require_admin)):
    """
    List available models and their configurations.
    
    Requires admin authentication.
    """
    from cortex.llm.executor import litellm_executor
    
    models = []
    
    if litellm_executor.config and "model_list" in litellm_executor.config:
        for model_config in litellm_executor.config["model_list"]:
            fallbacks = []
            if "fallbacks" in model_config:
                fallbacks = [fb.get("model", "") for fb in model_config["fallbacks"]]
            
            models.append(
                ModelInfo(
                    model_name=model_config.get("model_name", ""),
                    provider=model_config.get("litellm_params", {}).get("model", "").split("/")[0],
                    mode=model_config.get("model_info", {}).get("mode", "chat"),
                    supports_function_calling=model_config.get("model_info", {}).get("supports_function_calling", False),
                    fallbacks=fallbacks
                )
            )
    
    return models
