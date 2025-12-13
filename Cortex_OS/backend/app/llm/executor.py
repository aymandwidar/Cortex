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
    
    def get_openrouter_headers(self, api_key: str) -> Dict[str, str]:
        """
        Get OpenRouter-specific headers required for API calls.
        
        Args:
            api_key: OpenRouter API key
            
        Returns:
            Dictionary of headers
        """
        return {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://cortex-os.vercel.app",  # Required by OpenRouter
            "X-Title": "Cortex OS",  # Required by OpenRouter
            "Content-Type": "application/json"
        }
    
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
            
            # HARD FIX: Force OpenRouter headers for OpenRouter models
            if "openrouter" in actual_model.lower() or actual_model.startswith("openrouter/"):
                api_key = kwargs.get('api_key')
                if api_key:
                    # Set OpenRouter-specific headers using LiteLLM's headers parameter
                    openrouter_headers = {
                        "HTTP-Referer": "https://cortex-os.vercel.app",
                        "X-Title": "Cortex OS"
                    }
                    kwargs['headers'] = openrouter_headers
                    
                    logger.info(
                        "openrouter_headers_forced",
                        model=actual_model,
                        headers_set=True,
                        referer="https://cortex-os.vercel.app",
                        headers=openrouter_headers
                    )
                else:
                    logger.error(
                        "openrouter_no_api_key",
                        model=actual_model,
                        message="OpenRouter model requires API key but none found"
                    )
                    raise Exception(f"OpenRouter API key required for model {actual_model}")
            
            # Remove request_id from kwargs (not supported by all providers)
            # We use it for logging only
            kwargs.pop('request_id', None)
            
            # Call LiteLLM with actual model name and forced headers
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
            
            # Enhanced error logging for OpenRouter debugging
            is_openrouter = "openrouter" in actual_model.lower() or actual_model.startswith("openrouter/")
            
            logger.error(
                "llm_request_failed",
                model=model,
                actual_model=actual_model,
                request_id=request_id,
                latency_ms=latency_ms,
                error=str(e),
                error_type=type(e).__name__,
                is_openrouter=is_openrouter,
                has_api_key=bool(kwargs.get('api_key')),
                has_extra_headers=bool(kwargs.get('extra_headers')),
                traceback=traceback.format_exc()
            )
            
            # Special handling for OpenRouter errors
            if is_openrouter:
                logger.error(
                    "openrouter_failure_details",
                    model=actual_model,
                    error_message=str(e),
                    api_key_present=bool(kwargs.get('api_key')),
                    headers_present=bool(kwargs.get('extra_headers')),
                    suggestion="Check OpenRouter API key and required headers"
                )
            
            raise
    
    async def _get_api_key_for_model(self, model: str) -> Optional[str]:
        """
        Extract provider from model name and get API key.
        
        Args:
            model: Model name (e.g., "groq/llama-3.1-8b-instant", "openrouter/deepseek/deepseek-r1")
        
        Returns:
            API key or None
        """
        # Extract provider from model name
        provider = None
        
        if "/" in model:
            # Format: provider/model-name or openrouter/provider/model-name
            parts = model.split("/")
            provider = parts[0].lower()
            
            # Special handling for OpenRouter models
            if provider == "openrouter":
                provider = "openrouter"
                logger.debug(
                    "openrouter_model_detected",
                    model=model,
                    provider="openrouter"
                )
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
            elif "deepseek" in model_lower and "openrouter" not in model_lower:
                provider = "deepseek"
            elif "qwen" in model_lower and "openrouter" not in model_lower:
                provider = "qwen"
        
        if provider:
            api_key = await provider_key_manager.get_api_key(provider)
            if api_key:
                logger.debug(
                    "api_key_injected",
                    model=model,
                    provider=provider,
                    source="provider_key_manager",
                    key_length=len(api_key) if api_key else 0
                )
                return api_key
            else:
                logger.warning(
                    "no_api_key_for_provider",
                    model=model,
                    provider=provider,
                    message=f"No API key found for provider {provider}"
                )
        else:
            logger.warning(
                "provider_not_detected",
                model=model,
                message="Could not determine provider from model name"
            )
        
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