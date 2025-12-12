"""User DNA profile management."""

from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any
import json
import structlog

from cortex.storage.redis_client import redis_client

logger = structlog.get_logger()


@dataclass
class UserDNAProfile:
    """User preference and style profile."""
    style: str = "balanced"  # "concise", "detailed", "balanced", "conversational"
    tone: str = "professional"  # "professional", "casual", "friendly", "formal"
    skill_level: str = "intermediate"  # "beginner", "intermediate", "expert", "advanced"
    preferences: Dict[str, Any] = None
    
    def __post_init__(self):
        """Initialize preferences dict if None."""
        if self.preferences is None:
            self.preferences = {}
    
    def to_dict(self) -> Dict:
        """Convert profile to dictionary."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> "UserDNAProfile":
        """Create profile from dictionary."""
        return cls(
            style=data.get("style", "balanced"),
            tone=data.get("tone", "professional"),
            skill_level=data.get("skill_level", "intermediate"),
            preferences=data.get("preferences", {})
        )


class UserDNAManager:
    """
    Manages user DNA profiles for personalized AI interactions.
    
    Profiles are stored in Redis and injected into system prompts.
    """
    
    # Default profile for new users
    DEFAULT_PROFILE = UserDNAProfile()
    
    def __init__(self):
        """Initialize User DNA manager."""
        logger.info("user_dna_manager_initialized")
    
    async def get_profile(self, user_id: str) -> UserDNAProfile:
        """
        Retrieves profile from Redis or returns default.
        
        Args:
            user_id: User identifier
            
        Returns:
            UserDNAProfile instance
        """
        if not user_id:
            return self.DEFAULT_PROFILE
        
        # Try to get from Redis
        try:
            profile_data = await redis_client.get_user_dna(user_id)
            
            if profile_data:
                try:
                    profile = UserDNAProfile.from_dict(profile_data)
                    logger.debug("user_dna_retrieved", user_id=user_id)
                    return profile
                except Exception as e:
                    logger.error(
                        "user_dna_parse_failed",
                        user_id=user_id,
                        error=str(e)
                    )
                    return self.DEFAULT_PROFILE
        except Exception as e:
            # Redis connection failed, use default
            logger.warning(
                "user_dna_redis_unavailable",
                user_id=user_id,
                error=str(e)
            )
            return self.DEFAULT_PROFILE
        
        # Return default if not found
        logger.debug("user_dna_default_used", user_id=user_id)
        return self.DEFAULT_PROFILE
    
    async def update_profile(self, user_id: str, profile: UserDNAProfile):
        """
        Persists profile to Redis.
        
        Args:
            user_id: User identifier
            profile: UserDNAProfile to store
        """
        if not user_id:
            logger.warning("user_dna_update_skipped_no_user_id")
            return
        
        try:
            profile_dict = profile.to_dict()
            await redis_client.set_user_dna(user_id, profile_dict)
            
            logger.info(
                "user_dna_updated",
                user_id=user_id,
                style=profile.style,
                tone=profile.tone,
                skill_level=profile.skill_level
            )
        
        except Exception as e:
            logger.error(
                "user_dna_update_failed",
                user_id=user_id,
                error=str(e)
            )
    
    def format_system_prompt(self, profile: UserDNAProfile) -> str:
        """
        Formats profile as system prompt directives.
        
        Args:
            profile: UserDNAProfile to format
            
        Returns:
            Formatted system prompt string
        """
        prompt = f"""[USER PROFILE]
Communication Style: {profile.style}
Preferred Tone: {profile.tone}
Technical Level: {profile.skill_level}"""
        
        # Add custom preferences if any
        if profile.preferences:
            prompt += "\nPreferences:"
            for key, value in profile.preferences.items():
                prompt += f"\n  - {key}: {value}"
        
        prompt += "\n[END PROFILE]\n\n"
        
        return prompt


# Global User DNA manager instance
user_dna_manager = UserDNAManager()
