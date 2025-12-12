"""
Cortex V2 Agentic System - Worker Agents
Specialized workers for different types of tasks.
"""

import yaml
from typing import Dict, List, Any, Optional
import structlog

from cortex.llm.executor import litellm_executor
from cortex.config import settings

logger = structlog.get_logger()


class WorkerManager:
    """
    Manages the specialized worker agents and routes requests to them.
    """
    
    def __init__(self):
        self.workers = {}
        self._load_worker_configs()
        logger.info("worker_manager_initialized", worker_count=len(self.workers))
    
    def _load_worker_configs(self):
        """Load worker configurations from config.yaml."""
        try:
            with open(settings.litellm_config_path, 'r') as f:
                config = yaml.safe_load(f)
            
            agentic_models = config.get("agentic_models", {})
            
            for worker_name, worker_config in agentic_models.items():
                self.workers[worker_name] = WorkerAgent(worker_name, worker_config)
                
            logger.info("worker_configs_loaded", workers=list(self.workers.keys()))
            
        except Exception as e:
            logger.error("failed_to_load_worker_configs", error=str(e))
            # Initialize with minimal config
            self._initialize_fallback_workers()
    
    def _initialize_fallback_workers(self):
        """Initialize fallback workers if config loading fails."""
        fallback_configs = {
            "orchestrator": {
                "model": "groq/llama-3.1-8b-instant",
                "provider": "groq",
                "role": "Task orchestration",
                "max_tokens": 1000,
                "temperature": 0.3
            },
            "worker_logic": {
                "model": "groq/llama-3.1-70b-versatile",
                "provider": "groq",
                "role": "Code generation and reasoning",
                "max_tokens": 4000,
                "temperature": 0.1
            }
        }
        
        for worker_name, config in fallback_configs.items():
            self.workers[worker_name] = WorkerAgent(worker_name, config)
        
        logger.warning("using_fallback_worker_configs")
    
    async def call_worker(
        self,
        worker_name: str,
        messages: List[Dict[str, Any]],
        request_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Call a specific worker agent."""
        
        if worker_name not in self.workers:
            logger.error("worker_not_found", worker_name=worker_name, available=list(self.workers.keys()))
            # Fallback to orchestrator
            worker_name = "orchestrator"
        
        worker = self.workers[worker_name]
        return await worker.process(messages, request_id, **kwargs)
    
    def get_worker_info(self, worker_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific worker."""
        if worker_name in self.workers:
            return self.workers[worker_name].get_info()
        return None
    
    def list_workers(self) -> Dict[str, Dict[str, Any]]:
        """List all available workers and their capabilities."""
        return {name: worker.get_info() for name, worker in self.workers.items()}


class WorkerAgent:
    """
    Individual worker agent with specialized capabilities.
    """
    
    def __init__(self, name: str, config: Dict[str, Any]):
        self.name = name
        self.config = config
        self.model = config.get("model")
        self.provider = config.get("provider")
        self.role = config.get("role", "General purpose")
        self.max_tokens = config.get("max_tokens", 2000)
        self.temperature = config.get("temperature", 0.7)
        self.supports_tools = config.get("supports_tools", False)
        self.supports_vision = config.get("supports_vision", False)
        
        # Create specialized system prompts based on role
        self.system_prompt = self._create_system_prompt()
        
        logger.debug(
            "worker_agent_initialized",
            name=name,
            model=self.model,
            provider=self.provider,
            role=self.role
        )
    
    def _create_system_prompt(self) -> str:
        """Create a specialized system prompt based on the worker's role."""
        
        base_prompt = f"You are {self.name}, a specialized AI assistant focused on {self.role.lower()}."
        
        if self.name == "orchestrator":
            return f"""{base_prompt}

Your role is to coordinate and plan tasks efficiently. You should:
- Provide clear, concise responses
- Break down complex requests when needed
- Be direct and helpful
- Focus on speed and accuracy"""

        elif self.name == "worker_logic":
            return f"""{base_prompt}

You are an expert programmer and logical reasoner. You should:
- Write clean, well-documented code
- Use chain-of-thought reasoning
- Explain your logic step by step
- Test and validate your solutions
- Self-correct when errors are identified
- Focus on best practices and efficiency

When writing code:
1. Think through the problem step by step
2. Write clear, readable code with comments
3. Consider edge cases and error handling
4. Provide usage examples when helpful"""

        elif self.name == "worker_math":
            return f"""{base_prompt}

You are a mathematical expert specializing in STEM problems. You should:
- Show your work step by step
- Use proper mathematical notation
- Verify calculations carefully
- Explain concepts clearly
- Handle calculus, algebra, statistics, and more
- Provide accurate numerical results

When solving problems:
1. Identify what type of problem it is
2. Show the relevant formulas or methods
3. Work through the solution step by step
4. Double-check your calculations
5. Provide the final answer clearly"""

        elif self.name == "worker_vision_pro":
            return f"""{base_prompt}

You are an advanced vision analysis expert. You should:
- Analyze images in great detail
- Read and transcribe text accurately (OCR)
- Recognize handwriting and complex layouts
- Describe visual elements comprehensively
- Extract structured information from images
- Handle complex visual reasoning tasks

When analyzing images:
1. Describe what you see systematically
2. Read any text present (including handwritten)
3. Identify key visual elements and their relationships
4. Provide structured output when requested
5. Be thorough and accurate in your analysis"""

        elif self.name == "worker_vision_fast":
            return f"""{base_prompt}

You are a fast vision processing expert. You should:
- Quickly identify key elements in images
- Provide concise but accurate descriptions
- Handle high-volume image processing efficiently
- Focus on the most important visual information
- Be fast while maintaining accuracy

When analyzing images:
1. Quickly scan for the main subjects/objects
2. Provide a clear, concise description
3. Highlight the most important details
4. Keep responses focused and efficient"""

        else:
            return f"""{base_prompt}

You are a helpful AI assistant. Provide accurate, helpful responses while staying focused on your specialized role."""
    
    async def process(
        self,
        messages: List[Dict[str, Any]],
        request_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Process a request using this worker agent."""
        
        # Prepare messages with system prompt
        worker_messages = [
            {"role": "system", "content": self.system_prompt}
        ] + messages
        
        # Prepare parameters
        params = {
            "messages": worker_messages,
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "request_id": request_id,
            **kwargs
        }
        
        logger.info(
            "worker_processing_request",
            worker=self.name,
            model=self.model,
            request_id=request_id,
            message_count=len(worker_messages)
        )
        
        try:
            response = await litellm_executor.complete(**params)
            
            logger.info(
                "worker_request_completed",
                worker=self.name,
                request_id=request_id,
                response_length=len(response.get("choices", [{}])[0].get("message", {}).get("content", ""))
            )
            
            return response
            
        except Exception as e:
            logger.error(
                "worker_request_failed",
                worker=self.name,
                model=self.model,
                request_id=request_id,
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    def get_info(self) -> Dict[str, Any]:
        """Get information about this worker."""
        return {
            "name": self.name,
            "model": self.model,
            "provider": self.provider,
            "role": self.role,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "supports_tools": self.supports_tools,
            "supports_vision": self.supports_vision,
            "description": self.config.get("description", "")
        }


class WorkerCapabilities:
    """
    Utility class to check worker capabilities and requirements.
    """
    
    @staticmethod
    def requires_vision(messages: List[Dict[str, Any]]) -> bool:
        """Check if the request requires vision capabilities."""
        for message in messages:
            content = message.get("content", "")
            if isinstance(content, list):
                for part in content:
                    if part.get("type") == "image_url":
                        return True
        return False
    
    @staticmethod
    def requires_tools(task_type: str) -> bool:
        """Check if the task type requires tool execution."""
        tool_requiring_tasks = ["code_generation", "math_calculation"]
        return task_type in tool_requiring_tasks
    
    @staticmethod
    def get_best_worker_for_task(task_type: str, has_image: bool = False) -> str:
        """Get the best worker for a specific task type."""
        if has_image:
            return "worker_vision_fast"  # Default, can be escalated
        
        task_worker_map = {
            "code_generation": "worker_logic",
            "math_calculation": "worker_math",
            "image_analysis": "worker_vision_fast",
            "complex_reasoning": "worker_logic",
            "simple_chat": "orchestrator"
        }
        
        return task_worker_map.get(task_type, "orchestrator")


# Global worker manager instance
worker_manager = WorkerManager()