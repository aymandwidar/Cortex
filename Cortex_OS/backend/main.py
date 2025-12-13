#!/usr/bin/env python3
"""
Cortex OS Backend - Multi-Agent AI System
Main FastAPI application entry point
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import application modules
from app.agents.orchestrator import AgentOrchestrator
from app.llm.executor import LLMExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
orchestrator = None
llm_executor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global orchestrator, llm_executor
    
    # Startup
    logger.info("🚀 Starting Cortex OS Backend...")
    
    # Initialize LLM executor
    llm_executor = LLMExecutor()
    await llm_executor.initialize()
    
    # Initialize orchestrator
    orchestrator = AgentOrchestrator(llm_executor)
    await orchestrator.initialize()
    
    logger.info("✅ Cortex OS Backend initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Cortex OS Backend...")
    if orchestrator:
        await orchestrator.cleanup()
    if llm_executor:
        await llm_executor.cleanup()

# Create FastAPI app
app = FastAPI(
    title="Cortex OS",
    description="Multi-agent AI system with specialized reasoning capabilities",
    version="2.6.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.6.0",
        "service": "cortex-os-backend"
    }

# Chat completions endpoint (OpenAI compatible)
@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    """OpenAI-compatible chat completions endpoint"""
    try:
        if not orchestrator:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Get request data
        data = await request.json()
        
        # Process with orchestrator
        response = await orchestrator.process_request(data)
        
        return response
        
    except Exception as e:
        logger.error(f"Error in chat completions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin endpoints
@app.post("/admin/v1/generate_key")
async def generate_api_key(request: Request):
    """Generate API key for client applications"""
    try:
        # Simple key generation for demo
        import secrets
        import time
        
        api_key = f"ctx_{secrets.token_urlsafe(16)}_{int(time.time())}"
        
        return {
            "key": api_key,
            "created_at": int(time.time()),
            "status": "active"
        }
        
    except Exception as e:
        logger.error(f"Error generating API key: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# System info endpoint
@app.get("/v1/system/info")
async def system_info():
    """Get system information"""
    return {
        "version": "2.6.0",
        "agents": {
            "logic": "DeepSeek R1",
            "math": "Qwen 2.5 72B", 
            "code": "Llama 3.3 70B",
            "chat": "Llama 3.1 8B"
        },
        "status": "online"
    }

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
        log_level="info"
    )