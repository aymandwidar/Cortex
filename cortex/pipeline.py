"""Main request processing pipeline - V2 Agentic System."""

import uuid
import asyncio
import time
from typing import Dict, Any, List
import structlog

from cortex.pii.redactor import PIIRedactor
from cortex.sentiment.analyzer import SentimentAnalyzer
from cortex.routing.semantic_router import SemanticRouter
from cortex.memory.manager import memory_manager
from cortex.memory.summarizer import inject_context, memory_summarizer
from cortex.user_dna.manager import user_dna_manager
from cortex.llm.executor import litellm_executor
from cortex.prefetch.prefetcher import predictive_prefetcher
from cortex.observability.logger import cortex_logger
from cortex.observability.metrics import metrics_collector
from cortex.storage.redis_client import redis_client

# V2 Agentic System
from cortex.agents.orchestrator import orchestrator

logger = structlog.get_logger()


class RequestPipeline:
    """
    Orchestrates the complete request processing flow.
    
    Flow: Auth → PII → Sentiment → DNA → Router → Memory → LiteLLM → Response
    """
    
    def __init__(self):
        """Initialize pipeline components."""
        self.pii_redactor = PIIRedactor()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.semantic_router = SemanticRouter()
        
        logger.info("request_pipeline_initialized")
    
    async def process_request(
        self,
        messages: List[Dict[str, str]],
        user_id: str,
        model: str = "auto",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Process a chat completion request through the V2 Agentic Pipeline.
        
        Args:
            messages: List of message dictionaries
            user_id: User identifier
            model: Model name (or "auto" for agentic routing)
            **kwargs: Additional parameters
            
        Returns:
            Response dictionary
        """
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Track active request
        metrics_collector.start_request()
        
        logger.info(
            "agentic_request_started",
            request_id=request_id,
            user_id=user_id,
            message_count=len(messages),
            model=model
        )
        
        try:
            # Extract user message for processing
            user_message = self._extract_user_message(messages)
            
            # Step 1: PII Redaction
            redacted_message, pii_mapping = self.pii_redactor.redact(user_message)
            
            if pii_mapping:
                # Cache PII mapping
                await redis_client.set_pii_cache(request_id, pii_mapping)
                pii_types = list(set(k.split("_")[1] for k in pii_mapping.keys()))
                cortex_logger.log_pii_redaction(
                    request_id,
                    len(pii_mapping),
                    pii_types
                )
                metrics_collector.record_pii_redaction(pii_types)
            
            # Update messages with redacted content
            messages = self._update_user_message(messages, redacted_message)
            
            # Step 2: Sentiment Analysis
            sentiment_score = self.sentiment_analyzer.analyze(user_message)
            sentiment_override = self.sentiment_analyzer.should_override(sentiment_score)
            
            # Step 3: User DNA Profile
            user_profile = await user_dna_manager.get_profile(user_id)
            dna_prompt = user_dna_manager.format_system_prompt(user_profile)
            
            # Step 4: Memory Retrieval (optional - gracefully handle if Qdrant is not available)
            retrieved_context = []
            try:
                retrieved_context = await memory_manager.retrieve_context(
                    user_id,
                    user_message
                )
                if retrieved_context:
                    metrics_collector.record_memory_retrieval(user_id)
            except Exception as e:
                logger.warning(
                    "memory_retrieval_failed",
                    error=str(e),
                    user_id=user_id,
                    message="Memory features unavailable - continuing without context"
                )
            
            # Step 5: Context Injection
            # Inject DNA profile
            if messages and messages[0].get("role") == "system":
                messages[0]["content"] = dna_prompt + messages[0]["content"]
            else:
                messages.insert(0, {"role": "system", "content": dna_prompt})
            
            # Inject memory context
            messages = inject_context(messages, retrieved_context)
            
            # Step 6: Predictive Prefetching (async, non-blocking)
            workflow = await predictive_prefetcher.detect_workflow(user_message)
            if workflow:
                asyncio.create_task(
                    predictive_prefetcher.prefetch_async(
                        workflow,
                        {"prompt": user_message},
                        user_id
                    )
                )
            
            # Step 7: V2 AGENTIC SYSTEM - Route through Orchestrator
            if model == "auto":
                # Use the new agentic system for intelligent routing and execution
                logger.info("using_agentic_system", request_id=request_id)
                
                response = await orchestrator.process_request(
                    messages=messages,
                    user_id=user_id,
                    request_id=request_id,
                    **kwargs
                )
                
                # Extract model name from response for logging
                selected_model = response.get("model", "agentic-orchestrator")
                
            else:
                # Legacy V1 mode - direct model execution
                logger.info("using_legacy_mode", request_id=request_id, model=model)
                
                # V1 Semantic Routing (for backward compatibility)
                if model == "legacy-auto":
                    category = self.semantic_router.classify_intent(user_message)
                    selected_model = self.semantic_router.select_model(category, sentiment_override)
                    
                    if sentiment_override:
                        original_model = self.semantic_router.select_model(category, False)
                        cortex_logger.log_sentiment_override(
                            request_id,
                            user_id,
                            sentiment_score,
                            original_model,
                            selected_model
                        )
                        metrics_collector.record_sentiment_override(
                            sentiment_score,
                            original_model,
                            selected_model
                        )
                else:
                    selected_model = model
                
                # Direct LLM execution (V1 mode)
                response = await litellm_executor.complete(
                    messages=messages,
                    model=selected_model,
                    request_id=request_id,
                    **kwargs
                )
            
            # Step 8: PII Restoration
            if pii_mapping:
                response_content = response["choices"][0]["message"]["content"]
                restored_content = self.pii_redactor.restore(response_content, pii_mapping)
                response["choices"][0]["message"]["content"] = restored_content
            
            # Step 9: Async Memory Storage
            asyncio.create_task(
                self._store_memory_async(
                    user_id,
                    user_message,
                    response["choices"][0]["message"]["content"]
                )
            )
            
            # Calculate total latency
            latency_ms = (time.time() - start_time) * 1000
            latency_seconds = latency_ms / 1000
            
            # Log success
            cortex_logger.log_request(
                request_id,
                user_id,
                selected_model,
                latency_ms,
                True,
                response["usage"]["total_tokens"]
            )
            
            # Record metrics
            metrics_collector.record_request(
                model=selected_model,
                user_id=user_id,
                duration_seconds=latency_seconds,
                success=True,
                tokens=response["usage"]["total_tokens"]
            )
            
            logger.info(
                "agentic_request_completed", 
                request_id=request_id, 
                latency_ms=latency_ms,
                model=selected_model,
                mode="agentic" if model == "auto" else "legacy"
            )
            
            return response
        
        except Exception as e:
            # Calculate latency even for errors
            latency_ms = (time.time() - start_time) * 1000
            latency_seconds = latency_ms / 1000
            
            logger.error(
                "agentic_request_failed",
                request_id=request_id,
                error=str(e),
                error_type=type(e).__name__
            )
            
            cortex_logger.log_error(
                request_id,
                type(e).__name__,
                str(e)
            )
            
            # Record failed request metrics
            metrics_collector.record_request(
                model=model,
                user_id=user_id,
                duration_seconds=latency_seconds,
                success=False
            )
            
            raise
        
        finally:
            # Always decrement active requests
            metrics_collector.end_request()
    
    def _extract_user_message(self, messages: List[Dict[str, str]]) -> str:
        """Extract the last user message content."""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                return msg.get("content", "")
        return ""
    
    def _update_user_message(
        self,
        messages: List[Dict[str, str]],
        new_content: str
    ) -> List[Dict[str, str]]:
        """Update the last user message with new content."""
        updated = messages.copy()
        for i in range(len(updated) - 1, -1, -1):
            if updated[i].get("role") == "user":
                updated[i] = updated[i].copy()
                updated[i]["content"] = new_content
                break
        return updated
    
    async def _store_memory_async(
        self,
        user_id: str,
        user_message: str,
        assistant_response: str
    ):
        """Asynchronously store conversation in memory."""
        try:
            # Summarize conversation
            conversation = {
                "user": user_message,
                "assistant": assistant_response
            }
            
            summary = await memory_summarizer.summarize_conversation(conversation)
            
            if summary:
                try:
                    await memory_manager.store_memory(
                        user_id,
                        summary,
                        conversation
                    )
                    metrics_collector.record_memory_storage(user_id)
                except Exception as mem_error:
                    logger.warning(
                        "memory_storage_failed",
                        user_id=user_id,
                        error=str(mem_error),
                        message="Memory storage unavailable - continuing without storage"
                    )
        except Exception as e:
            logger.error(
                "memory_summarization_failed",
                user_id=user_id,
                error=str(e)
            )


# Global pipeline instance
request_pipeline = RequestPipeline()
