"""API Key management service."""

import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from cortex.database.models import APIKey

logger = structlog.get_logger()


class APIKeyService:
    """Service for managing API keys."""
    
    KEY_PREFIX = "ctx_"
    KEY_LENGTH = 32  # bytes, will be 64 hex characters
    
    @staticmethod
    def generate_key() -> str:
        """
        Generate a new API key.
        
        Format: ctx_<random_hex>
        
        Returns:
            API key string
        """
        random_bytes = secrets.token_bytes(APIKeyService.KEY_LENGTH)
        key_hex = random_bytes.hex()
        return f"{APIKeyService.KEY_PREFIX}{key_hex}"
    
    @staticmethod
    def hash_key(key: str) -> str:
        """
        Hash an API key for storage.
        
        Args:
            key: API key to hash
            
        Returns:
            SHA-256 hash of the key
        """
        return hashlib.sha256(key.encode()).hexdigest()
    
    @staticmethod
    def get_key_prefix(key: str) -> str:
        """
        Extract displayable prefix from key.
        
        Args:
            key: Full API key
            
        Returns:
            First 12 characters for display
        """
        return key[:12] if len(key) >= 12 else key
    
    @staticmethod
    async def create_key(
        db: AsyncSession,
        name: str,
        user_id: Optional[str] = None,
        expires_in_days: Optional[int] = None,
        metadata: Optional[dict] = None
    ) -> tuple[APIKey, str]:
        """
        Create a new API key.
        
        Args:
            db: Database session
            name: Human-readable name for the key
            user_id: Optional user identifier
            expires_in_days: Optional expiration in days
            metadata: Optional metadata dictionary
            
        Returns:
            Tuple of (APIKey model, plaintext key)
            
        Note:
            The plaintext key is only returned once and never stored.
        """
        # Generate key
        plaintext_key = APIKeyService.generate_key()
        key_hash = APIKeyService.hash_key(plaintext_key)
        key_prefix = APIKeyService.get_key_prefix(plaintext_key)
        
        # Calculate expiration
        expires_at = None
        if expires_in_days:
            expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)
        
        # Create database record
        api_key = APIKey(
            key_hash=key_hash,
            key_prefix=key_prefix,
            name=name,
            user_id=user_id,
            is_active=True,
            expires_at=expires_at,
            key_metadata=metadata or {}
        )
        
        db.add(api_key)
        await db.flush()
        await db.refresh(api_key)
        
        logger.info(
            "api_key_created",
            key_id=api_key.id,
            name=name,
            prefix=key_prefix,
            user_id=user_id,
            expires_at=expires_at.isoformat() if expires_at else None
        )
        
        return api_key, plaintext_key
    
    @staticmethod
    async def validate_key(db: AsyncSession, key: str) -> Optional[APIKey]:
        """
        Validate an API key and return the associated record.
        
        Args:
            db: Database session
            key: Plaintext API key to validate
            
        Returns:
            APIKey model if valid, None otherwise
        """
        key_hash = APIKeyService.hash_key(key)
        
        # Query for key
        result = await db.execute(
            select(APIKey).where(APIKey.key_hash == key_hash)
        )
        api_key = result.scalar_one_or_none()
        
        if not api_key:
            logger.debug("api_key_not_found", key_prefix=key[:12])
            return None
        
        # Check if valid
        if not api_key.is_valid():
            logger.warning(
                "api_key_invalid",
                key_id=api_key.id,
                is_active=api_key.is_active,
                expired=api_key.expires_at < datetime.now(timezone.utc) if api_key.expires_at else False
            )
            return None
        
        # Update last used timestamp
        api_key.last_used_at = datetime.now(timezone.utc)
        await db.flush()
        
        logger.debug(
            "api_key_validated",
            key_id=api_key.id,
            name=api_key.name,
            user_id=api_key.user_id
        )
        
        return api_key
    
    @staticmethod
    async def revoke_key(db: AsyncSession, key_id: int) -> bool:
        """
        Revoke an API key by ID.
        
        Args:
            db: Database session
            key_id: ID of the key to revoke
            
        Returns:
            True if revoked, False if not found
        """
        result = await db.execute(
            select(APIKey).where(APIKey.id == key_id)
        )
        api_key = result.scalar_one_or_none()
        
        if not api_key:
            logger.warning("api_key_revoke_not_found", key_id=key_id)
            return False
        
        api_key.is_active = False
        await db.flush()
        
        logger.info(
            "api_key_revoked",
            key_id=key_id,
            name=api_key.name,
            prefix=api_key.key_prefix
        )
        
        return True
    
    @staticmethod
    async def list_keys(
        db: AsyncSession,
        user_id: Optional[str] = None,
        include_inactive: bool = False
    ) -> List[APIKey]:
        """
        List API keys.
        
        Args:
            db: Database session
            user_id: Optional filter by user_id
            include_inactive: Whether to include inactive keys
            
        Returns:
            List of APIKey models
        """
        query = select(APIKey)
        
        if user_id:
            query = query.where(APIKey.user_id == user_id)
        
        if not include_inactive:
            query = query.where(APIKey.is_active == True)
        
        query = query.order_by(APIKey.created_at.desc())
        
        result = await db.execute(query)
        keys = result.scalars().all()
        
        logger.debug(
            "api_keys_listed",
            count=len(keys),
            user_id=user_id,
            include_inactive=include_inactive
        )
        
        return list(keys)
