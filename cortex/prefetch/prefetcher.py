"""Predictive prefetching for common workflows."""

import asyncio
import hashlib
from typing import Optional, Dict, Any
import structlog

from cortex.storage.redis_client import redis_client

logger = structlog.get_logger()


class PredictivePrefetcher:
    """
    Identifies workflow patterns and prepares follow-up responses.
    
    Caches results in Redis for fast retrieval.
    """
    
    # Workflow patterns and their likely follow-ups
    WORKFLOW_PATTERNS = {
        "plan_trip": ["generate itinerary", "suggest hotels", "find flights"],
        "book_meeting": ["draft meeting summary", "create agenda", "send invites"],
        "draft_email": ["suggest subject lines", "format signature", "add greeting"],
        "write_code": ["add tests", "add documentation", "review code"],
        "debug_code": ["suggest fixes", "explain error", "find similar issues"]
    }
    
    def __init__(self):
        """Initialize predictive prefetcher."""
        logger.info("predictive_prefetcher_initialized")
    
    async def detect_workflow(self, prompt: str) -> Optional[str]:
        """
        Detects workflow keywords in prompt.
        
        Args:
            prompt: User prompt to analyze
            
        Returns:
            Workflow name if detected, None otherwise
        """
        if not prompt:
            return None
        
        prompt_lower = prompt.lower()
        
        # Check for workflow keywords
        for workflow, keywords in self.WORKFLOW_PATTERNS.items():
            workflow_keywords = workflow.replace("_", " ")
            
            if workflow_keywords in prompt_lower:
                logger.info("workflow_detected", workflow=workflow, prompt_length=len(prompt))
                return workflow
        
        return None
    
    async def prefetch_async(
        self,
        workflow: str,
        context: Dict[str, Any],
        user_id: str
    ):
        """
        Executes background task to prepare follow-up.
        
        Stores result in Redis with TTL.
        
        Args:
            workflow: Detected workflow name
            context: Context dictionary for the workflow
            user_id: User identifier
        """
        if workflow not in self.WORKFLOW_PATTERNS:
            logger.warning("unknown_workflow", workflow=workflow)
            return
        
        try:
            # Generate cache key
            cache_key = self._generate_cache_key(user_id, workflow, context)
            
            # Check if already cached
            existing = await redis_client.get_prefetch_cache(cache_key)
            if existing:
                logger.debug("prefetch_already_cached", cache_key=cache_key)
                return
            
            # Get follow-up actions for this workflow
            follow_ups = self.WORKFLOW_PATTERNS[workflow]
            
            # Prepare prefetch result (simplified - in production would call LLM)
            prefetch_result = {
                "workflow": workflow,
                "follow_ups": follow_ups,
                "context": context,
                "status": "ready"
            }
            
            # Store in cache
            await redis_client.set_prefetch_cache(cache_key, prefetch_result)
            
            logger.info(
                "prefetch_completed",
                workflow=workflow,
                cache_key=cache_key,
                follow_up_count=len(follow_ups)
            )
        
        except Exception as e:
            logger.error(
                "prefetch_failed",
                workflow=workflow,
                error=str(e)
            )
            # Don't raise - prefetch failures should not impact main request
    
    async def get_cached_result(
        self,
        user_id: str,
        workflow: str,
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves cached prefetch result.
        
        Args:
            user_id: User identifier
            workflow: Workflow name
            context: Context dictionary
            
        Returns:
            Cached result or None if not found
        """
        cache_key = self._generate_cache_key(user_id, workflow, context)
        
        result = await redis_client.get_prefetch_cache(cache_key)
        
        if result:
            logger.info("prefetch_cache_hit", cache_key=cache_key)
        else:
            logger.debug("prefetch_cache_miss", cache_key=cache_key)
        
        return result
    
    def _generate_cache_key(
        self,
        user_id: str,
        workflow: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Generates cache key for prefetch result.
        
        Args:
            user_id: User identifier
            workflow: Workflow name
            context: Context dictionary
            
        Returns:
            Cache key string
        """
        # Create hash of context for consistent keys
        context_str = str(sorted(context.items()))
        context_hash = hashlib.md5(context_str.encode()).hexdigest()[:8]
        
        return f"prefetch:{user_id}:{workflow}:{context_hash}"


# Global prefetcher instance
predictive_prefetcher = PredictivePrefetcher()
