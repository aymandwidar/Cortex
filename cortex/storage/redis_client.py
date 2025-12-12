"""Redis client wrapper for Cortex."""

import json
from typing import Optional, Any
import redis.asyncio as redis
import structlog

from cortex.config import settings

logger = structlog.get_logger()


class RedisClient:
    """Async Redis client wrapper with convenience methods."""
    
    def __init__(self):
        """Initialize Redis client."""
        self._client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Establish connection to Redis."""
        if self._client is None:
            self._client = await redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            logger.info("redis_connected", url=settings.redis_url)
    
    async def disconnect(self):
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("redis_disconnected")
    
    async def set_pii_cache(self, request_id: str, pii_mapping: dict) -> None:
        """
        Store PII mapping with TTL.
        
        Args:
            request_id: Unique request identifier
            pii_mapping: Dictionary mapping tokens to original PII values
        """
        if not self._client:
            await self.connect()
        
        key = f"pii:{request_id}"
        value = json.dumps(pii_mapping)
        
        await self._client.setex(
            key,
            settings.redis_pii_ttl,
            value
        )
        
        logger.debug("pii_cached", request_id=request_id, ttl=settings.redis_pii_ttl)
    
    async def get_pii_cache(self, request_id: str) -> Optional[dict]:
        """
        Retrieve PII mapping from cache.
        
        Args:
            request_id: Unique request identifier
            
        Returns:
            PII mapping dictionary or None if not found
        """
        if not self._client:
            await self.connect()
        
        key = f"pii:{request_id}"
        value = await self._client.get(key)
        
        if value:
            logger.debug("pii_cache_hit", request_id=request_id)
            return json.loads(value)
        
        logger.debug("pii_cache_miss", request_id=request_id)
        return None
    
    async def set_prefetch_cache(self, cache_key: str, result: Any, ttl: Optional[int] = None) -> None:
        """
        Store prefetch result with TTL.
        
        Args:
            cache_key: Cache key
            result: Result to cache
            ttl: Time to live in seconds (defaults to settings.redis_prefetch_ttl)
        """
        if not self._client:
            await self.connect()
        
        ttl = ttl or settings.redis_prefetch_ttl
        value = json.dumps(result)
        
        await self._client.setex(cache_key, ttl, value)
        logger.debug("prefetch_cached", key=cache_key, ttl=ttl)
    
    async def get_prefetch_cache(self, cache_key: str) -> Optional[Any]:
        """
        Retrieve prefetch result from cache.
        
        Args:
            cache_key: Cache key
            
        Returns:
            Cached result or None if not found
        """
        if not self._client:
            await self.connect()
        
        value = await self._client.get(cache_key)
        
        if value:
            logger.debug("prefetch_cache_hit", key=cache_key)
            return json.loads(value)
        
        logger.debug("prefetch_cache_miss", key=cache_key)
        return None
    
    async def set_user_dna(self, user_id: str, profile: dict) -> None:
        """
        Store user DNA profile.
        
        Args:
            user_id: User identifier
            profile: User DNA profile dictionary
        """
        if not self._client:
            await self.connect()
        
        key = f"user_dna:{user_id}"
        value = json.dumps(profile)
        
        await self._client.set(key, value)
        logger.debug("user_dna_stored", user_id=user_id)
    
    async def get_user_dna(self, user_id: str) -> Optional[dict]:
        """
        Retrieve user DNA profile.
        
        Args:
            user_id: User identifier
            
        Returns:
            User DNA profile dictionary or None if not found
        """
        if not self._client:
            await self.connect()
        
        key = f"user_dna:{user_id}"
        value = await self._client.get(key)
        
        if value:
            logger.debug("user_dna_retrieved", user_id=user_id)
            return json.loads(value)
        
        logger.debug("user_dna_not_found", user_id=user_id)
        return None


# Global Redis client instance
redis_client = RedisClient()
