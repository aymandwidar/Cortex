"""Prometheus metrics for Cortex."""

from prometheus_client import Counter, Histogram, Gauge, Info
from typing import Optional
import time

# Request metrics
requests_total = Counter(
    'cortex_requests_total',
    'Total number of requests',
    ['model', 'user_id', 'status']
)

request_duration_seconds = Histogram(
    'cortex_request_duration_seconds',
    'Request duration in seconds',
    ['model', 'user_id'],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0)
)

tokens_used_total = Counter(
    'cortex_tokens_used_total',
    'Total tokens used',
    ['model', 'user_id']
)

# Fallback metrics
fallbacks_total = Counter(
    'cortex_fallbacks_total',
    'Total number of fallback attempts',
    ['primary_model', 'fallback_model', 'reason']
)

# Sentiment override metrics
sentiment_overrides_total = Counter(
    'cortex_sentiment_overrides_total',
    'Total number of sentiment-based overrides',
    ['original_model', 'override_model']
)

sentiment_score_histogram = Histogram(
    'cortex_sentiment_score',
    'Distribution of sentiment scores',
    buckets=(-1.0, -0.8, -0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0)
)

# PII metrics
pii_redactions_total = Counter(
    'cortex_pii_redactions_total',
    'Total number of PII redactions',
    ['pii_type']
)

# Cache metrics
cache_hits_total = Counter(
    'cortex_cache_hits_total',
    'Total number of cache hits',
    ['cache_type']
)

cache_misses_total = Counter(
    'cortex_cache_misses_total',
    'Total number of cache misses',
    ['cache_type']
)

# Memory metrics
memory_retrievals_total = Counter(
    'cortex_memory_retrievals_total',
    'Total number of memory retrievals',
    ['user_id']
)

memory_storage_total = Counter(
    'cortex_memory_storage_total',
    'Total number of memory storage operations',
    ['user_id']
)

# API Key metrics
api_key_validations_total = Counter(
    'cortex_api_key_validations_total',
    'Total number of API key validations',
    ['status']  # valid, invalid, expired, revoked
)

api_key_usage_total = Counter(
    'cortex_api_key_usage_total',
    'Total API key usage',
    ['key_id', 'user_id']
)

# System metrics
active_requests = Gauge(
    'cortex_active_requests',
    'Number of requests currently being processed'
)

# Info metrics
cortex_info = Info(
    'cortex_version',
    'Cortex version and build information'
)


class MetricsCollector:
    """Collects and exports Prometheus metrics."""
    
    def __init__(self):
        """Initialize metrics collector."""
        # Set version info
        cortex_info.info({
            'version': '0.1.0',
            'service': 'cortex-ai-router'
        })
    
    def record_request(
        self,
        model: str,
        user_id: str,
        duration_seconds: float,
        success: bool,
        tokens: Optional[int] = None
    ):
        """
        Record request metrics.
        
        Args:
            model: Model used
            user_id: User identifier
            duration_seconds: Request duration in seconds
            success: Whether request succeeded
            tokens: Total tokens used
        """
        status = 'success' if success else 'error'
        
        requests_total.labels(
            model=model,
            user_id=user_id or 'anonymous',
            status=status
        ).inc()
        
        request_duration_seconds.labels(
            model=model,
            user_id=user_id or 'anonymous'
        ).observe(duration_seconds)
        
        if tokens:
            tokens_used_total.labels(
                model=model,
                user_id=user_id or 'anonymous'
            ).inc(tokens)
    
    def record_fallback(
        self,
        primary_model: str,
        fallback_model: str,
        reason: str
    ):
        """
        Record fallback event.
        
        Args:
            primary_model: Primary model that failed
            fallback_model: Fallback model used
            reason: Reason for fallback
        """
        fallbacks_total.labels(
            primary_model=primary_model,
            fallback_model=fallback_model,
            reason=reason
        ).inc()
    
    def record_sentiment_override(
        self,
        sentiment_score: float,
        original_model: str,
        override_model: str
    ):
        """
        Record sentiment override event.
        
        Args:
            sentiment_score: Sentiment score
            original_model: Model that would have been selected
            override_model: Model selected due to override
        """
        sentiment_overrides_total.labels(
            original_model=original_model,
            override_model=override_model
        ).inc()
        
        sentiment_score_histogram.observe(sentiment_score)
    
    def record_pii_redaction(self, pii_types: list):
        """
        Record PII redaction.
        
        Args:
            pii_types: List of PII types redacted
        """
        for pii_type in pii_types:
            pii_redactions_total.labels(pii_type=pii_type).inc()
    
    def record_cache_hit(self, cache_type: str):
        """
        Record cache hit.
        
        Args:
            cache_type: Type of cache
        """
        cache_hits_total.labels(cache_type=cache_type).inc()
    
    def record_cache_miss(self, cache_type: str):
        """
        Record cache miss.
        
        Args:
            cache_type: Type of cache
        """
        cache_misses_total.labels(cache_type=cache_type).inc()
    
    def record_memory_retrieval(self, user_id: str):
        """
        Record memory retrieval.
        
        Args:
            user_id: User identifier
        """
        memory_retrievals_total.labels(user_id=user_id).inc()
    
    def record_memory_storage(self, user_id: str):
        """
        Record memory storage.
        
        Args:
            user_id: User identifier
        """
        memory_storage_total.labels(user_id=user_id).inc()
    
    def record_api_key_validation(self, status: str):
        """
        Record API key validation.
        
        Args:
            status: Validation status (valid, invalid, expired, revoked)
        """
        api_key_validations_total.labels(status=status).inc()
    
    def record_api_key_usage(self, key_id: int, user_id: Optional[str]):
        """
        Record API key usage.
        
        Args:
            key_id: API key ID
            user_id: User identifier
        """
        api_key_usage_total.labels(
            key_id=str(key_id),
            user_id=user_id or 'none'
        ).inc()
    
    def start_request(self):
        """Increment active requests counter."""
        active_requests.inc()
    
    def end_request(self):
        """Decrement active requests counter."""
        active_requests.dec()


# Global metrics collector
metrics_collector = MetricsCollector()
