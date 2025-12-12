"""Centralized logging for Cortex."""

import structlog
from typing import Optional

logger = structlog.get_logger()


class CortexLogger:
    """
    Tracks metrics, errors, and performance for Cortex.
    
    Logs to Google Cloud Logging in production, stdout in development.
    """
    
    def __init__(self):
        """Initialize Cortex logger."""
        self.logger = logger
    
    def log_request(
        self,
        request_id: str,
        user_id: str,
        model: str,
        latency_ms: float,
        success: bool,
        tokens: Optional[int] = None
    ):
        """
        Logs request metrics.
        
        Args:
            request_id: Unique request identifier
            user_id: User identifier
            model: Model used
            latency_ms: Request latency in milliseconds
            success: Whether request succeeded
            tokens: Total tokens used (optional)
        """
        self.logger.info(
            "request_completed",
            request_id=request_id,
            user_id=user_id,
            model=model,
            latency_ms=latency_ms,
            success=success,
            tokens=tokens or 0
        )
    
    def log_fallback(
        self,
        request_id: str,
        primary_model: str,
        fallback_model: str,
        reason: str
    ):
        """
        Logs fallback events.
        
        Args:
            request_id: Unique request identifier
            primary_model: Primary model that failed
            fallback_model: Fallback model used
            reason: Reason for fallback
        """
        self.logger.warning(
            "fallback_triggered",
            request_id=request_id,
            primary_model=primary_model,
            fallback_model=fallback_model,
            reason=reason
        )
    
    def log_sentiment_override(
        self,
        request_id: str,
        user_id: str,
        sentiment_score: float,
        original_model: str,
        override_model: str
    ):
        """
        Logs sentiment-based routing override.
        
        Args:
            request_id: Unique request identifier
            user_id: User identifier
            sentiment_score: Sentiment score that triggered override
            original_model: Model that would have been selected
            override_model: Model selected due to override
        """
        self.logger.info(
            "sentiment_override",
            request_id=request_id,
            user_id=user_id,
            sentiment_score=sentiment_score,
            original_model=original_model,
            override_model=override_model
        )
    
    def log_error(
        self,
        request_id: str,
        error_type: str,
        error_message: str,
        context: Optional[dict] = None
    ):
        """
        Logs errors with context.
        
        Args:
            request_id: Unique request identifier
            error_type: Type of error
            error_message: Error message
            context: Additional context dictionary
        """
        self.logger.error(
            "error_occurred",
            request_id=request_id,
            error_type=error_type,
            error_message=error_message,
            **(context or {})
        )
    
    def log_pii_redaction(
        self,
        request_id: str,
        pii_count: int,
        pii_types: list
    ):
        """
        Logs PII redaction events.
        
        Args:
            request_id: Unique request identifier
            pii_count: Number of PII instances redacted
            pii_types: Types of PII redacted
        """
        self.logger.info(
            "pii_redacted",
            request_id=request_id,
            pii_count=pii_count,
            pii_types=pii_types
        )
    
    def log_cache_hit(
        self,
        request_id: str,
        cache_type: str,
        cache_key: str
    ):
        """
        Logs cache hit events.
        
        Args:
            request_id: Unique request identifier
            cache_type: Type of cache (prefetch, memory, etc.)
            cache_key: Cache key
        """
        self.logger.debug(
            "cache_hit",
            request_id=request_id,
            cache_type=cache_type,
            cache_key=cache_key
        )
    
    def log_cache_miss(
        self,
        request_id: str,
        cache_type: str,
        cache_key: str
    ):
        """
        Logs cache miss events.
        
        Args:
            request_id: Unique request identifier
            cache_type: Type of cache
            cache_key: Cache key
        """
        self.logger.debug(
            "cache_miss",
            request_id=request_id,
            cache_type=cache_type,
            cache_key=cache_key
        )


# Global logger instance
cortex_logger = CortexLogger()
