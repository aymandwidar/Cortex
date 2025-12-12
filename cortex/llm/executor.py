"""LiteLLM execution layer with fallback handling."""

from typing import Dict, List, Any, Optional
import time
import litellm
import structlog

from cortex.config import settings
from cortex.admin.provider_keys import provider_key_manager

logger = structlog.get_logger()


class LiteLLMExecutor:
    """
    Executes model calls with fallback configuration.
    
    Wraps litellm.acompletion with logging and error handling.
    """
    
    def __init__(self):
        """Initialize LiteLLM executor."""
        # Configure LiteLLM
        litellm.set_verbose = False
        
        # Load config if available (for model name resolution only, not for API keys)
        try:
            import yaml
            with open(settings.litellm_config_path, 'r') as f:
                self.config = yaml.safe_load(f)
            
            # DO NOT set litellm.model_list - we inject API keys dynamically
            # litellm.model_list = self.config["model_list"]
            
            logger.info("litellm_config_loaded", path=settings.litellm_config_path)
        except Exception as e:
            logger.warning("litellm_config_load_failed", error=str(e))
            self.config = {}
        
        logger.info("litellm_executor_initialized")
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        model: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Calls litellm.acompletion with fallback configuration.
        
        Logs latency and success/failure.
        
        Args:
            messages: List of message dictionaries
            model: Model name to use
            **kwargs: Additional parameters for completion
            
        Returns:
            Completion response dictionary
            
        Raises:
            Exception: If all models (including fallbacks) fail
        """
        start_time = time.time()
        request_id = kwargs.get('request_id', 'unknown')
        
        try:
            logger.info(
                "llm_request_started",
                model=model,
                request_id=request_id,
                message_count=len(messages)
            )
            
            # Resolve model name from config if it's a custom name
            actual_model = model
            if self.config and "model_list" in self.config:
                for model_config in self.config["model_list"]:
                    if model_config.get("model_name") == model:
                        actual_model = model_config["litellm_params"]["model"]
                        logger.debug(
                            "model_resolved",
                            custom_name=model,
                            actual_model=actual_model
                        )
                        break
            
            # Inject API key from database if not provided
            if 'api_key' not in kwargs:
                api_key = await self._get_api_key_for_model(actual_model)
                if api_key:
                    kwargs['api_key'] = api_key
                    logger.info(
                        "api_key_injected_for_request",
                        model=actual_model,
                        has_key=bool(api_key),
                        key_preview=f"{api_key[:10]}...{api_key[-4:]}" if api_key else None
                    )
                else:
                    logger.warning(
                        "no_api_key_found_for_model",
                        model=actual_model,
                        message="No API key available for this model"
                    )
            
            # Remove request_id from kwargs (not supported by all providers)
            # We use it for logging only
            kwargs.pop('request_id', None)
            
            # Call LiteLLM with actual model name
            response = await litellm.acompletion(
                model=actual_model,
                messages=messages,
                **kwargs
            )
            
            latency_ms = (time.time() - start_time) * 1000
            
            # Extract response details
            response_dict = {
                "id": response.id,
                "model": response.model,
                "choices": [
                    {
                        "message": {
                            "role": choice.message.role,
                            "content": choice.message.content
                        },
                        "finish_reason": choice.finish_reason
                    }
                    for choice in response.choices
                ],
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                    "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                    "total_tokens": response.usage.total_tokens if response.usage else 0
                }
            }
            
            logger.info(
                "llm_request_success",
                model=model,
                request_id=request_id,
                latency_ms=latency_ms,
                tokens=response_dict["usage"]["total_tokens"]
            )
            
            return response_dict
        
        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000
            
            import traceback
            logger.error(
                "llm_request_failed",
                model=model,
                actual_model=actual_model,
                request_id=request_id,
                latency_ms=latency_ms,
                error=str(e),
                error_type=type(e).__name__,
                traceback=traceback.format_exc()
            )
            
            raise
    
    async def _get_api_key_for_model(self, model: str) -> Optional[str]:
        """
        Extract provider from model name and get API key.
        
        Args:
            model: Model name (e.g., "groq/llama-3.1-8b-instant", "gpt-4o")
        
        Returns:
            API key or None
        """
        # Extract provider from model name
        provider = None
        
        if "/" in model:
            # Format: provider/model-name
            provider = model.split("/")[0].lower()
        else:
            # Infer provider from model name
            model_lower = model.lower()
            if "gpt" in model_lower or model_lower.startswith("o1"):
                provider = "openai"
            elif "claude" in model_lower:
                provider = "anthropic"
            elif "gemini" in model_lower or "palm" in model_lower:
                provider = "google"
            elif "command" in model_lower:
                provider = "cohere"
            elif "mistral" in model_lower:
                provider = "mistral"
            elif "llama" in model_lower and "groq" not in model_lower:
                provider = "together"
            elif "deepseek" in model_lower:
                provider = "deepseek"
        
        if provider:
            api_key = await provider_key_manager.get_api_key(provider)
            if api_key:
                logger.debug(
                    "api_key_injected",
                    model=model,
                    provider=provider,
                    source="provider_key_manager"
                )
                return api_key
        
        return None
    
    def get_fallback_models(self, primary_model: str) -> List[str]:
        """
        Get fallback models for a given primary model.
        
        Args:
            primary_model: Primary model name
            
        Returns:
            List of fallback model names
        """
        if not self.config or "model_list" not in self.config:
            return []
        
        # Find model in config
        for model_config in self.config["model_list"]:
            if model_config.get("model_name") == primary_model:
                fallbacks = model_config.get("fallbacks", [])
                return [fb.get("model") for fb in fallbacks if "model" in fb]
        
        return []


# Global LiteLLM executor instance
litellm_executor = LiteLLMExecutor()
