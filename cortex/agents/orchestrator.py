"""
Cortex V2 Agentic System - Orchestrator
The central coordinator that breaks down tasks and routes to specialized workers.
"""

import json
import re
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import structlog

from cortex.llm.executor import litellm_executor
from cortex.agents.workers import WorkerManager
from cortex.agents.tools import ToolExecutor

logger = structlog.get_logger()


class TaskType(str, Enum):
    """Types of tasks the orchestrator can identify."""
    SIMPLE_CHAT = "simple_chat"
    CODE_GENERATION = "code_generation"
    MATH_CALCULATION = "math_calculation"
    IMAGE_ANALYSIS = "image_analysis"
    COMPLEX_REASONING = "complex_reasoning"
    TOOL_EXECUTION = "tool_execution"


class AgenticStep:
    """Represents a single step in the agentic loop."""
    def __init__(self, step_number: int, action: str, input_data: Any, output_data: Any = None, error: str = None):
        self.step_number = step_number
        self.action = action
        self.input_data = input_data
        self.output_data = output_data
        self.error = error
        self.timestamp = None


class Orchestrator:
    """
    The central orchestrator that implements the agentic loop:
    1. Analyze user request
    2. Plan execution strategy
    3. Route to appropriate workers
    4. Execute tools if needed
    5. Consolidate final response
    """
    
    def __init__(self):
        self.worker_manager = WorkerManager()
        self.tool_executor = ToolExecutor()
        self.max_steps = 10
        self.max_retries = 3
        
        # Task classification patterns
        self.task_patterns = {
            TaskType.CODE_GENERATION: [
                # Basic coding patterns
                r"write.*code", r"implement.*function", r"create.*script",
                r"debug.*code", r"fix.*bug", r"refactor", r"python.*code",
                r"javascript.*code", r"sql.*query", r"algorithm",
                r"function.*to", r"write.*function", r"create.*function",
                r"fibonacci", r"factorial", r"sorting", r"programming",
                
                # Programming language keywords
                r"python", r"javascript", r"java", r"c\+\+", r"c#", r"php", r"ruby",
                r"go", r"rust", r"swift", r"kotlin", r"typescript", r"html", r"css",
                
                # Development tasks
                r"build.*app", r"create.*program", r"develop", r"code.*for",
                r"script.*to", r"program.*that", r"software", r"application",
                r"web.*app", r"mobile.*app", r"api", r"database", r"backend",
                r"frontend", r"full.*stack", r"framework", r"library",
                
                # Specific coding requests
                r"class.*definition", r"method", r"variable", r"loop", r"condition",
                r"if.*else", r"for.*loop", r"while.*loop", r"try.*catch",
                r"import", r"package", r"module", r"namespace", r"object",
                r"array", r"list", r"dictionary", r"hash", r"json", r"xml",
                
                # Problem-solving with code
                r"automate", r"parse", r"extract", r"process.*data", r"convert",
                r"transform", r"validate", r"authenticate", r"encrypt", r"decrypt",
                r"compress", r"decompress", r"serialize", r"deserialize",
                
                # Development concepts
                r"design.*pattern", r"mvc", r"rest.*api", r"graphql", r"microservice",
                r"docker", r"kubernetes", r"ci/cd", r"git", r"version.*control",
                r"test.*case", r"unit.*test", r"integration.*test", r"tdd", r"bdd"
            ],
            TaskType.MATH_CALCULATION: [
                # Basic math patterns
                r"calculate", r"solve.*equation", r"math.*problem",
                r"derivative", r"integral", r"statistics", r"probability",
                r"algebra", r"geometry", r"trigonometry", r"\d+.*\+.*\d+",
                r"what.*is.*\d+.*[\+\-\*\/].*\d+",
                
                # Business logic and optimization patterns
                r"solve.*this", r"step.*by.*step", r"cost.*effective", r"cost-effective",
                r"optimize", r"optimization", r"defect.*rate", r"percentage", r"percent",
                r"total.*cost", r"production.*rate", r"profit", r"loss", r"revenue",
                r"compare.*cost", r"versus", r"vs\.", r"which.*better", r"which.*cheaper",
                r"budget", r"financial", r"economic", r"efficiency", r"productivity",
                
                # Manufacturing and business terms
                r"manufacturing", r"production", r"quality.*control", r"defects",
                r"units.*per", r"rate.*of", r"throughput", r"capacity", r"utilization",
                r"break.*even", r"roi", r"return.*on.*investment", r"margin",
                
                # Problem-solving indicators
                r"problem.*solving", r"word.*problem", r"scenario", r"situation",
                r"given.*that", r"if.*then", r"assuming", r"suppose",
                r"determine", r"find.*the", r"what.*would", r"how.*much",
                r"how.*many", r"minimum", r"maximum", r"optimal", r"best.*option"
            ],
            TaskType.IMAGE_ANALYSIS: [
                r"analyze.*image", r"what.*in.*image", r"describe.*picture",
                r"read.*text.*image", r"handwriting", r"OCR", r"transcribe.*image"
            ],
            TaskType.COMPLEX_REASONING: [
                r"explain.*complex", r"analyze.*deeply", r"compare.*contrast",
                r"pros.*cons", r"strategy", r"plan.*detailed", r"research",
                
                # System Design & Architecture (High Complexity)
                r"architecture", r"system.*design", r"microservices", r"database.*design",
                r"kubernetes", r"aws", r"deployment.*strategy", r"scalability", r"enterprise",
                r"cloud.*architecture", r"distributed.*system", r"load.*balancing",
                r"high.*availability", r"fault.*tolerance", r"disaster.*recovery",
                r"infrastructure", r"devops", r"ci.*cd", r"containerization",
                r"orchestration", r"service.*mesh", r"api.*gateway", r"message.*queue",
                r"event.*driven", r"caching.*strategy", r"cdn", r"performance.*optimization",
                r"security.*architecture", r"authentication.*system", r"authorization",
                r"data.*pipeline", r"etl", r"big.*data", r"analytics.*platform",
                r"monitoring.*system", r"logging.*architecture", r"observability",
                
                # Database and schema design (complex reasoning)
                r"design.*database", r"design.*schema", r"schema.*design", r"data.*model",
                r"entity.*relationship", r"erd", r"normalization", r"denormalization",
                r"database.*architecture", r"data.*architecture"
            ]
        }
        
        logger.info("orchestrator_initialized", max_steps=self.max_steps)
    
    async def process_request(
        self,
        messages: List[Dict[str, Any]],
        user_id: str,
        request_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main entry point for the agentic system.
        Implements the Thinking -> Tool -> Observation loop.
        """
        logger.info(
            "agentic_request_started",
            request_id=request_id,
            user_id=user_id,
            message_count=len(messages)
        )
        
        steps = []
        current_step = 1
        
        try:
            # Step 1: Analyze the user request
            user_message = self._extract_user_message(messages)
            has_image = self._has_image_content(messages)
            
            step = AgenticStep(current_step, "analyze_request", {
                "user_message": user_message,
                "has_image": has_image
            })
            
            # Step 2: Classify task type
            task_type = await self._classify_task(user_message, has_image)
            step.output_data = {"task_type": task_type}
            steps.append(step)
            current_step += 1
            
            logger.info(
                "task_classified",
                request_id=request_id,
                task_type=task_type,
                has_image=has_image
            )
            
            # Step 3: Plan execution strategy
            execution_plan = await self._create_execution_plan(
                task_type, user_message, messages, request_id
            )
            
            steps.append(AgenticStep(
                current_step, "create_plan", {"task_type": task_type}, execution_plan
            ))
            current_step += 1
            
            # Step 4: Execute the agentic loop
            final_response = await self._execute_agentic_loop(
                execution_plan, messages, user_id, request_id, steps, current_step
            )
            
            logger.info(
                "agentic_request_completed",
                request_id=request_id,
                total_steps=len(steps),
                task_type=task_type
            )
            
            return final_response
            
        except Exception as e:
            logger.error(
                "agentic_request_failed",
                request_id=request_id,
                error=str(e),
                error_type=type(e).__name__,
                total_steps=len(steps)
            )
            
            # Fallback to simple response
            return await self._fallback_response(messages, user_id, request_id, **kwargs)
    
    async def _classify_task(self, user_message: str, has_image: bool) -> TaskType:
        """Classify the user's request into a task type with smart priority routing."""
        user_message_lower = user_message.lower()
        
        # Image analysis takes priority if image is present
        if has_image:
            return TaskType.IMAGE_ANALYSIS
        
        # Score each task type based on pattern matches
        task_scores = {}
        
        for task_type, patterns in self.task_patterns.items():
            score = 0
            matches = []
            
            for pattern in patterns:
                if re.search(pattern, user_message_lower):
                    score += 1
                    matches.append(pattern)
            
            if score > 0:
                task_scores[task_type] = {
                    'score': score,
                    'matches': matches
                }
        
        # If no patterns matched, default to simple chat
        if not task_scores:
            return TaskType.SIMPLE_CHAT
        
        # Find the task type with the highest score
        best_task = max(task_scores.items(), key=lambda x: x[1]['score'])
        best_task_type = best_task[0]
        best_score = best_task[1]['score']
        
        logger.debug(
            "task_classification_results",
            user_message_preview=user_message[:100],
            all_scores=task_scores,
            selected_task=best_task_type,
            selected_score=best_score
        )
        
        # Apply priority rules for tie-breaking and special cases
        
        # PRIORITY 1: Math/Business Logic (if score >= 2 or specific high-value patterns)
        if (best_task_type == TaskType.MATH_CALCULATION and best_score >= 2) or \
           any(re.search(pattern, user_message_lower) for pattern in [
               r"calculate", r"solve.*this", r"step.*by.*step", r"optimize", 
               r"cost.*effective", r"defect.*rate", r"production.*rate",
               r"total.*cost", r"profit", r"loss", r"percentage"
           ]):
            return TaskType.MATH_CALCULATION
        
        # PRIORITY 2: System Design & Architecture (takes precedence over coding)
        if (best_task_type == TaskType.COMPLEX_REASONING and best_score >= 1) or \
           any(re.search(pattern, user_message_lower) for pattern in [
               r"architecture", r"system.*design", r"microservices", r"database.*design",
               r"design.*database", r"design.*schema", r"schema.*design",
               r"scalability", r"enterprise", r"infrastructure", r"deployment.*strategy",
               r"kubernetes", r"aws", r"cloud.*architecture", r"distributed.*system"
           ]):
            return TaskType.COMPLEX_REASONING
        
        # PRIORITY 3: Code Generation (if score >= 2 or specific coding patterns)
        if (best_task_type == TaskType.CODE_GENERATION and best_score >= 2) or \
           any(re.search(pattern, user_message_lower) for pattern in [
               r"write.*code", r"implement.*function", r"create.*script",
               r"python", r"javascript", r"algorithm", r"program.*that",
               r"function.*to", r"automate", r"build.*app"
           ]):
            return TaskType.CODE_GENERATION
        
        # If we have a clear winner with score >= 1, use it
        if best_score >= 1:
            return best_task_type
        
        # Default to simple chat
        return TaskType.SIMPLE_CHAT
    
    async def _create_execution_plan(
        self,
        task_type: TaskType,
        user_message: str,
        messages: List[Dict[str, Any]],
        request_id: str
    ) -> Dict[str, Any]:
        """Create an execution plan based on the task type."""
        
        plan = {
            "task_type": task_type,
            "worker": None,
            "requires_tools": False,
            "max_iterations": 1,
            "strategy": "direct"
        }
        
        if task_type == TaskType.CODE_GENERATION:
            plan.update({
                "worker": "worker_logic",
                "requires_tools": True,
                "max_iterations": 3,
                "strategy": "self_correcting_coder",
                "tools": ["execute_python"]
            })
            
        elif task_type == TaskType.MATH_CALCULATION:
            plan.update({
                "worker": "worker_math",
                "requires_tools": True,
                "max_iterations": 2,
                "strategy": "mathematical_solver",
                "tools": ["calculate"]
            })
            
        elif task_type == TaskType.IMAGE_ANALYSIS:
            # Use vision strategy to select appropriate model
            vision_worker = self._select_vision_model(user_message)
            plan.update({
                "worker": vision_worker,
                "requires_tools": False,
                "max_iterations": 1,
                "strategy": "waterfall_vision"
            })
            
        elif task_type == TaskType.COMPLEX_REASONING:
            plan.update({
                "worker": "worker_logic",
                "requires_tools": False,
                "max_iterations": 2,
                "strategy": "chain_of_thought"
            })
            
        else:  # SIMPLE_CHAT
            plan.update({
                "worker": "orchestrator",
                "requires_tools": False,
                "max_iterations": 1,
                "strategy": "direct_response"
            })
        
        logger.debug(
            "execution_plan_created",
            request_id=request_id,
            plan=plan
        )
        
        return plan
    
    def _select_vision_model(self, user_message: str) -> str:
        """
        Implement the "Waterfall Vision" strategy.
        Default to fast model, escalate to pro for complex tasks.
        """
        user_message_lower = user_message.lower()
        
        # Check for complexity keywords
        complexity_keywords = [
            "analyze text", "handwriting", "details", "OCR", 
            "read", "transcribe", "complex", "detailed"
        ]
        
        for keyword in complexity_keywords:
            if keyword in user_message_lower:
                logger.debug("vision_escalation", reason=keyword, model="worker_vision_pro")
                return "worker_vision_pro"
        
        logger.debug("vision_default", model="worker_vision_fast")
        return "worker_vision_fast"
    
    async def _execute_agentic_loop(
        self,
        execution_plan: Dict[str, Any],
        messages: List[Dict[str, Any]],
        user_id: str,
        request_id: str,
        steps: List[AgenticStep],
        current_step: int
    ) -> Dict[str, Any]:
        """Execute the main agentic loop with the specified strategy."""
        
        strategy = execution_plan["strategy"]
        worker = execution_plan["worker"]
        max_iterations = execution_plan["max_iterations"]
        
        if strategy == "self_correcting_coder":
            return await self._run_coding_agent(
                messages, worker, request_id, steps, current_step, max_iterations
            )
        elif strategy == "mathematical_solver":
            return await self._run_math_agent(
                messages, worker, request_id, steps, current_step, max_iterations
            )
        elif strategy == "waterfall_vision":
            return await self._run_vision_agent(
                messages, worker, request_id, steps, current_step
            )
        elif strategy == "chain_of_thought":
            return await self._run_reasoning_agent(
                messages, worker, request_id, steps, current_step, max_iterations
            )
        else:  # direct_response
            return await self._run_direct_response(
                messages, worker, request_id, steps, current_step
            )
    
    async def _run_coding_agent(
        self,
        messages: List[Dict[str, Any]],
        worker: str,
        request_id: str,
        steps: List[AgenticStep],
        current_step: int,
        max_iterations: int
    ) -> Dict[str, Any]:
        """
        Implement the "Self-Correcting Coder" loop.
        """
        logger.info("coding_agent_started", request_id=request_id, worker=worker)
        
        current_messages = messages.copy()
        
        for iteration in range(max_iterations):
            # Step: Generate code
            step = AgenticStep(
                current_step, f"generate_code_iteration_{iteration + 1}", 
                {"messages": len(current_messages)}
            )
            
            try:
                response = await self.worker_manager.call_worker(
                    worker, current_messages, request_id
                )
                
                step.output_data = {
                    "response_length": len(response.get("choices", [{}])[0].get("message", {}).get("content", "")),
                    "has_code": self._contains_code(response)
                }
                steps.append(step)
                current_step += 1
                
                # Check if response contains code that needs execution
                if self._contains_code(response):
                    code_blocks = self._extract_code_blocks(response)
                    
                    for i, code_block in enumerate(code_blocks):
                        # Step: Execute code
                        exec_step = AgenticStep(
                            current_step, f"execute_code_block_{i + 1}",
                            {"code_length": len(code_block)}
                        )
                        
                        try:
                            execution_result = await self.tool_executor.execute_python(code_block)
                            exec_step.output_data = {
                                "success": execution_result.get("success", False),
                                "output_length": len(str(execution_result.get("output", "")))
                            }
                            
                            # If execution failed, add error context for next iteration
                            if not execution_result.get("success", False):
                                error_message = execution_result.get("error", "Unknown error")
                                current_messages.append({
                                    "role": "user",
                                    "content": f"The code execution failed with error: {error_message}. Please fix the code."
                                })
                                exec_step.error = error_message
                                
                        except Exception as e:
                            exec_step.error = str(e)
                            current_messages.append({
                                "role": "user", 
                                "content": f"Code execution failed: {str(e)}. Please provide a corrected version."
                            })
                        
                        steps.append(exec_step)
                        current_step += 1
                
                # If no errors or this is the last iteration, return response
                if iteration == max_iterations - 1 or not any(step.error for step in steps[-2:]):
                    return response
                    
            except Exception as e:
                step.error = str(e)
                steps.append(step)
                logger.error("coding_iteration_failed", iteration=iteration, error=str(e))
                
                if iteration == max_iterations - 1:
                    raise
        
        # Should not reach here, but fallback
        return await self._fallback_response(messages, "", request_id)
    
    async def _run_math_agent(
        self,
        messages: List[Dict[str, Any]],
        worker: str,
        request_id: str,
        steps: List[AgenticStep],
        current_step: int,
        max_iterations: int
    ) -> Dict[str, Any]:
        """Run the mathematical reasoning agent."""
        logger.info("math_agent_started", request_id=request_id, worker=worker)
        
        # For now, delegate to the math worker
        step = AgenticStep(current_step, "math_calculation", {"worker": worker})
        
        try:
            response = await self.worker_manager.call_worker(worker, messages, request_id)
            step.output_data = {"success": True}
            steps.append(step)
            return response
            
        except Exception as e:
            step.error = str(e)
            steps.append(step)
            raise
    
    async def _run_vision_agent(
        self,
        messages: List[Dict[str, Any]],
        worker: str,
        request_id: str,
        steps: List[AgenticStep],
        current_step: int
    ) -> Dict[str, Any]:
        """Run the vision analysis agent."""
        logger.info("vision_agent_started", request_id=request_id, worker=worker)
        
        step = AgenticStep(current_step, "vision_analysis", {"worker": worker})
        
        try:
            response = await self.worker_manager.call_worker(worker, messages, request_id)
            step.output_data = {"success": True}
            steps.append(step)
            return response
            
        except Exception as e:
            step.error = str(e)
            steps.append(step)
            
            # Fallback: if pro model fails, try fast model
            if worker == "worker_vision_pro":
                logger.info("vision_fallback", from_model="pro", to_model="fast")
                return await self._run_vision_agent(
                    messages, "worker_vision_fast", request_id, steps, current_step + 1
                )
            raise
    
    async def _run_reasoning_agent(
        self,
        messages: List[Dict[str, Any]],
        worker: str,
        request_id: str,
        steps: List[AgenticStep],
        current_step: int,
        max_iterations: int
    ) -> Dict[str, Any]:
        """Run the chain-of-thought reasoning agent."""
        logger.info("reasoning_agent_started", request_id=request_id, worker=worker)
        
        step = AgenticStep(current_step, "chain_of_thought", {"worker": worker})
        
        try:
            response = await self.worker_manager.call_worker(worker, messages, request_id)
            step.output_data = {"success": True}
            steps.append(step)
            return response
            
        except Exception as e:
            step.error = str(e)
            steps.append(step)
            raise
    
    async def _run_direct_response(
        self,
        messages: List[Dict[str, Any]],
        worker: str,
        request_id: str,
        steps: List[AgenticStep],
        current_step: int
    ) -> Dict[str, Any]:
        """Run a direct response (simple chat)."""
        logger.info("direct_response_started", request_id=request_id, worker=worker)
        
        step = AgenticStep(current_step, "direct_response", {"worker": worker})
        
        try:
            response = await self.worker_manager.call_worker(worker, messages, request_id)
            step.output_data = {"success": True}
            steps.append(step)
            return response
            
        except Exception as e:
            step.error = str(e)
            steps.append(step)
            raise
    
    async def _fallback_response(
        self,
        messages: List[Dict[str, Any]],
        user_id: str,
        request_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Fallback to simple orchestrator response if agentic system fails."""
        logger.warning("using_fallback_response", request_id=request_id)
        
        try:
            return await self.worker_manager.call_worker("orchestrator", messages, request_id)
        except Exception as e:
            logger.error("fallback_failed", error=str(e))
            
            # Ultimate fallback - return error response
            return {
                "id": f"fallback-{request_id}",
                "model": "orchestrator-fallback",
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": "I apologize, but I'm experiencing technical difficulties. Please try again later."
                    },
                    "finish_reason": "error"
                }],
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }
    
    def _extract_user_message(self, messages: List[Dict[str, Any]]) -> str:
        """Extract the last user message content."""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                content = msg.get("content", "")
                if isinstance(content, str):
                    return content
                elif isinstance(content, list):
                    # Handle multimodal content
                    text_parts = [part.get("text", "") for part in content if part.get("type") == "text"]
                    return " ".join(text_parts)
        return ""
    
    def _has_image_content(self, messages: List[Dict[str, Any]]) -> bool:
        """Check if any message contains image content."""
        for msg in messages:
            content = msg.get("content", "")
            if isinstance(content, list):
                for part in content:
                    if part.get("type") == "image_url":
                        return True
        return False
    
    def _contains_code(self, response: Dict[str, Any]) -> bool:
        """Check if response contains code blocks."""
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        return "```" in content
    
    def _extract_code_blocks(self, response: Dict[str, Any]) -> List[str]:
        """Extract code blocks from response."""
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Find all code blocks
        code_blocks = []
        pattern = r"```(?:python|py)?\n(.*?)```"
        matches = re.findall(pattern, content, re.DOTALL)
        
        for match in matches:
            code_blocks.append(match.strip())
        
        return code_blocks


# Global orchestrator instance
orchestrator = Orchestrator()