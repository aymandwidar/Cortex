"""Configuration management for Cortex."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    # Authentication
    kirio_cortex_master_key: str = "ad222333"
    
    # API Keys for upstream providers
    openai_api_key: str = ""
    groq_api_key: str = ""
    deepseek_api_key: str = ""
    anthropic_api_key: str = ""
    
    # Redis configuration
    redis_url: str = "redis://localhost:6379"
    redis_pii_ttl: int = 300  # 5 minutes
    redis_prefetch_ttl: int = 600  # 10 minutes
    
    # Qdrant configuration
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "cortex_memory"
    qdrant_api_key: str = ""
    
    # Model configuration
    litellm_config_path: str = "config.yaml"
    
    # Sentiment analysis
    sentiment_override_threshold: float = -0.8
    
    # Memory configuration
    memory_top_k: int = 3
    
    # CORS
    allowed_origins: List[str] = ["*"]
    
    # Logging
    log_level: str = "INFO"
    google_cloud_project: str = ""
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./cortex.db"


settings = Settings()
