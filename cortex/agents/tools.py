"""
Cortex V2 Agentic System - Tool Execution
Tools that agents can use to perform actions beyond text generation.
"""

import subprocess
import tempfile
import os
import sys
import ast
import math
import json
from typing import Dict, Any, List, Optional
import structlog
import asyncio
from datetime import datetime

logger = structlog.get_logger()


class ToolExecutor:
    """
    Executes tools that agents can use to perform actions.
    """
    
    def __init__(self):
        self.enabled_tools = {
            "execute_python": True,
            "calculate": True,
            "web_search": False  # Placeholder for future
        }
        self.timeout = 30  # seconds
        self.max_output_length = 10000  # characters
        
        logger.info("tool_executor_initialized", enabled_tools=list(self.enabled_tools.keys()))
    
    async def execute_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Execute a specific tool by name."""
        
        if not self.enabled_tools.get(tool_name, False):
            return {
                "success": False,
                "error": f"Tool '{tool_name}' is not enabled or does not exist",
                "output": None
            }
        
        logger.info("tool_execution_started", tool=tool_name, kwargs_keys=list(kwargs.keys()))
        
        try:
            if tool_name == "execute_python":
                return await self.execute_python(kwargs.get("code", ""))
            elif tool_name == "calculate":
                return await self.calculate(kwargs.get("expression", ""))
            elif tool_name == "web_search":
                return await self.web_search(kwargs.get("query", ""))
            else:
                return {
                    "success": False,
                    "error": f"Unknown tool: {tool_name}",
                    "output": None
                }
                
        except Exception as e:
            logger.error("tool_execution_failed", tool=tool_name, error=str(e))
            return {
                "success": False,
                "error": str(e),
                "output": None
            }
    
    async def execute_python(self, code: str) -> Dict[str, Any]:
        """
        Execute Python code in a sandboxed environment.
        Returns the output or error.
        """
        if not code.strip():
            return {
                "success": False,
                "error": "No code provided",
                "output": None
            }
        
        logger.info("python_execution_started", code_length=len(code))
        
        try:
            # Basic security checks
            if not self._is_code_safe(code):
                return {
                    "success": False,
                    "error": "Code contains potentially unsafe operations",
                    "output": None
                }
            
            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            try:
                # Execute the code with timeout
                process = await asyncio.create_subprocess_exec(
                    sys.executable, temp_file,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                try:
                    stdout, stderr = await asyncio.wait_for(
                        process.communicate(), timeout=self.timeout
                    )
                    
                    stdout_text = stdout.decode('utf-8')
                    stderr_text = stderr.decode('utf-8')
                    
                    # Limit output length
                    if len(stdout_text) > self.max_output_length:
                        stdout_text = stdout_text[:self.max_output_length] + "\n... (output truncated)"
                    
                    if len(stderr_text) > self.max_output_length:
                        stderr_text = stderr_text[:self.max_output_length] + "\n... (error truncated)"
                    
                    success = process.returncode == 0
                    output = stdout_text if success else stderr_text
                    
                    logger.info(
                        "python_execution_completed",
                        success=success,
                        return_code=process.returncode,
                        output_length=len(output)
                    )
                    
                    return {
                        "success": success,
                        "output": output,
                        "error": stderr_text if not success else None,
                        "return_code": process.returncode
                    }
                    
                except asyncio.TimeoutError:
                    process.kill()
                    await process.wait()
                    return {
                        "success": False,
                        "error": f"Code execution timed out after {self.timeout} seconds",
                        "output": None
                    }
                    
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file)
                except:
                    pass
                    
        except Exception as e:
            logger.error("python_execution_error", error=str(e))
            return {
                "success": False,
                "error": f"Execution error: {str(e)}",
                "output": None
            }
    
    def _is_code_safe(self, code: str) -> bool:
        """
        Basic safety check for Python code.
        This is not comprehensive security - just basic filtering.
        """
        dangerous_patterns = [
            "import os",
            "import subprocess",
            "import sys",
            "__import__",
            "exec(",
            "eval(",
            "open(",
            "file(",
            "input(",
            "raw_input(",
            "compile(",
            "reload(",
            "globals(",
            "locals(",
            "vars(",
            "dir(",
            "hasattr(",
            "getattr(",
            "setattr(",
            "delattr(",
            "exit(",
            "quit(",
        ]
        
        code_lower = code.lower()
        for pattern in dangerous_patterns:
            if pattern in code_lower:
                logger.warning("unsafe_code_detected", pattern=pattern)
                return False
        
        # Try to parse the code to check for syntax errors
        try:
            ast.parse(code)
        except SyntaxError as e:
            logger.warning("code_syntax_error", error=str(e))
            return False
        
        return True
    
    async def calculate(self, expression: str) -> Dict[str, Any]:
        """
        Safely evaluate mathematical expressions.
        """
        if not expression.strip():
            return {
                "success": False,
                "error": "No expression provided",
                "output": None
            }
        
        logger.info("calculation_started", expression=expression)
        
        try:
            # Create a safe environment for evaluation
            safe_dict = {
                "__builtins__": {},
                "abs": abs,
                "round": round,
                "min": min,
                "max": max,
                "sum": sum,
                "pow": pow,
                "sqrt": math.sqrt,
                "sin": math.sin,
                "cos": math.cos,
                "tan": math.tan,
                "asin": math.asin,
                "acos": math.acos,
                "atan": math.atan,
                "log": math.log,
                "log10": math.log10,
                "exp": math.exp,
                "pi": math.pi,
                "e": math.e,
                "factorial": math.factorial,
                "ceil": math.ceil,
                "floor": math.floor,
            }
            
            # Evaluate the expression
            result = eval(expression, safe_dict, {})
            
            logger.info("calculation_completed", result=result)
            
            return {
                "success": True,
                "output": str(result),
                "result": result,
                "error": None
            }
            
        except Exception as e:
            logger.error("calculation_error", expression=expression, error=str(e))
            return {
                "success": False,
                "error": f"Calculation error: {str(e)}",
                "output": None
            }
    
    async def web_search(self, query: str) -> Dict[str, Any]:
        """
        Placeholder for web search functionality.
        This would integrate with a search API in the future.
        """
        logger.info("web_search_requested", query=query)
        
        return {
            "success": False,
            "error": "Web search is not yet implemented",
            "output": None,
            "message": "This feature is planned for a future release"
        }
    
    def get_available_tools(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all available tools."""
        return {
            "execute_python": {
                "enabled": self.enabled_tools.get("execute_python", False),
                "description": "Execute Python code in a sandboxed environment",
                "parameters": {
                    "code": "Python code to execute"
                },
                "timeout": self.timeout,
                "safety": "Basic safety checks applied"
            },
            "calculate": {
                "enabled": self.enabled_tools.get("calculate", False),
                "description": "Safely evaluate mathematical expressions",
                "parameters": {
                    "expression": "Mathematical expression to evaluate"
                },
                "supported_functions": [
                    "abs", "round", "min", "max", "sum", "pow", "sqrt",
                    "sin", "cos", "tan", "asin", "acos", "atan",
                    "log", "log10", "exp", "factorial", "ceil", "floor",
                    "pi", "e"
                ]
            },
            "web_search": {
                "enabled": self.enabled_tools.get("web_search", False),
                "description": "Search the web for information (planned feature)",
                "parameters": {
                    "query": "Search query"
                },
                "status": "Not yet implemented"
            }
        }


class ToolRegistry:
    """
    Registry for managing and discovering available tools.
    """
    
    def __init__(self):
        self.tools = {}
        self._register_default_tools()
    
    def _register_default_tools(self):
        """Register the default set of tools."""
        self.tools.update({
            "execute_python": {
                "name": "execute_python",
                "description": "Execute Python code",
                "category": "programming",
                "requires_sandbox": True
            },
            "calculate": {
                "name": "calculate",
                "description": "Perform mathematical calculations",
                "category": "mathematics",
                "requires_sandbox": False
            },
            "web_search": {
                "name": "web_search",
                "description": "Search the web",
                "category": "information",
                "requires_sandbox": False,
                "status": "planned"
            }
        })
    
    def register_tool(self, name: str, info: Dict[str, Any]):
        """Register a new tool."""
        self.tools[name] = info
        logger.info("tool_registered", name=name, category=info.get("category", "unknown"))
    
    def get_tools_by_category(self, category: str) -> Dict[str, Dict[str, Any]]:
        """Get all tools in a specific category."""
        return {
            name: info for name, info in self.tools.items()
            if info.get("category") == category
        }
    
    def get_tool_info(self, name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific tool."""
        return self.tools.get(name)
    
    def list_available_tools(self) -> List[str]:
        """List all available tool names."""
        return list(self.tools.keys())


# Global instances
tool_executor = ToolExecutor()
tool_registry = ToolRegistry()