"""Provider API key management from database."""

import os
from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import structlog

from cortex.database.connection import AsyncSessionLocal

logger = structlog.get_logger()


class ProviderKeyManager:
    """Manages API keys from database with fallback to environment variables."""
    
    def __init__(self):
        self._cache: Dict[str, str] = {}
        self._cache_initialized = False
    
    async def get_api_key(self, provider: str) -> Optional[str]:
        """
        Get API key for a provider.
        
        Priority:
        1. Database (Settings page)
        2. Environment variable
        3. None
        
        Args:
            provider: Provider name (groq, openai, deepseek, etc.)
        
        Returns:
            API key or None
        """
        # Check cache first
        if provider in self._cache:
            return self._cache[provider]
        
        # Try database
        try:
            # Import here to avoid circular dependency
            from cortex.admin.settings import ProviderSetting, decrypt_api_key
            
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(ProviderSetting).where(
                        ProviderSetting.provider_name == provider,
                        ProviderSetting.is_active == True
                    )
                )
                setting = result.scalar_one_or_none()
                
                if setting:
                    # Decrypt and cache
                    api_key = decrypt_api_key(setting.api_key_encrypted)
                    self._cache[provider] = api_key
                    logger.info(
                        "provider_key_loaded_from_db",
                        provider=provider,
                        source="database"
                    )
                    return api_key
        except Exception as e:
            logger.warning(
                "failed_to_load_provider_key_from_db",
                provider=provider,
                error=str(e)
            )
        
        # Fallback to environment variable
        env_var_map = {
            "groq": "GROQ_API_KEY",
            "openai": "OPENAI_API_KEY",
            "deepseek": "DEEPSEEK_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
            "google": "GOOGLE_API_KEY",
            "cohere": "COHERE_API_KEY",
            "mistral": "MISTRAL_API_KEY",
            "together": "TOGETHER_API_KEY",
            "huggingface": "HUGGINGFACE_API_KEY",
            "perplexity": "PERPLEXITY_API_KEY",
            "openrouter": "OPENROUTER_API_KEY",
        }
        
        env_var = env_var_map.get(provider.lower())
        if env_var:
            api_key = os.getenv(env_var)
            if api_key and not api_key.startswith("your-") and not api_key.endswith("-here"):
                self._cache[provider] = api_key
                logger.info(
                    "provider_key_loaded_from_env",
                    provider=provider,
                    source="environment"
                )
                return api_key
        
        logger.warning(
            "provider_key_not_found",
            provider=provider,
            message="No API key found in database or environment"
        )
        return None
    
    async def refresh_cache(self):
        """Clear cache to force reload from database."""
        self._cache.clear()
        self._cache_initialized = False
        logger.info("provider_key_cache_cleared")
    
    async def get_all_providers(self) -> Dict[str, bool]:
        """
        Get status of all configured providers.
        
        Returns:
            Dict mapping provider name to whether it has a valid key
        """
        providers = {}
        
        # Check database
        try:
            # Import here to avoid circular dependency
            from cortex.admin.settings import ProviderSetting
            
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(ProviderSetting).where(ProviderSetting.is_active == True)
                )
                settings = result.scalars().all()
                
                for setting in settings:
                    providers[setting.provider_name] = True
        except Exception as e:
            logger.warning("failed_to_load_providers_from_db", error=str(e))
        
        # Check environment variables
        env_providers = {
            "groq": "GROQ_API_KEY",
            "openai": "OPENAI_API_KEY",
            "deepseek": "DEEPSEEK_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
        }
        
        for provider, env_var in env_providers.items():
            if provider not in providers:
                api_key = os.getenv(env_var)
                if api_key and not api_key.startswith("your-") and not api_key.endswith("-here"):
                    providers[provider] = True
        
        return providers


# Global instance
provider_key_manager = ProviderKeyManager()
