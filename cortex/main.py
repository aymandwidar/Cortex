"""Main FastAPI application for Cortex AI Router."""

import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import structlog

from cortex.config import settings
from cortex.middleware.auth import AuthMiddleware
from cortex.database.connection import init_db

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    # Startup
    logger.info("cortex_starting")
    await init_db()
    logger.info("cortex_ready")
    
    yield
    
    # Shutdown
    logger.info("cortex_shutting_down")


app = FastAPI(
    title="Kirio Cortex",
    description="Universal AI Router and Orchestration Layer",
    version="0.1.0",
    lifespan=lifespan
)

# Add authentication middleware
app.add_middleware(AuthMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from cortex.models import ChatCompletionRequest, ChatCompletionResponse
from cortex.pipeline import request_pipeline
from cortex.errors import (
    CortexError,
    cortex_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)
from cortex.admin.routes import router as admin_router
from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Add exception handlers
app.add_exception_handler(CortexError, cortex_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include admin routes
app.include_router(admin_router)


@app.post("/v1/chat/completions", response_model=ChatCompletionResponse)
async def chat_completions(request: ChatCompletionRequest):
    """
    OpenAI-compatible chat completions endpoint.
    
    Processes requests through the full Cortex pipeline:
    Auth → PII → Sentiment → DNA → Router → Memory → LiteLLM
    """
    # Extract user_id from request
    user_id = request.user or "anonymous"
    
    # Convert messages to dict format
    messages = [msg.model_dump() for msg in request.messages]
    
    # Process through pipeline
    response = await request_pipeline.process_request(
        messages=messages,
        user_id=user_id,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens
    )
    
    return response


@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run."""
    return {"status": "healthy", "service": "cortex"}


@app.get("/health/ready")
async def readiness_check():
    """Readiness check that verifies dependencies."""
    from cortex.storage.redis_client import redis_client
    from cortex.memory.manager import memory_manager
    
    status = {"status": "ready", "service": "cortex", "dependencies": {}}
    
    # Check Redis
    try:
        await redis_client.connect()
        status["dependencies"]["redis"] = "connected"
    except Exception as e:
        status["dependencies"]["redis"] = f"unavailable: {str(e)}"
        status["status"] = "degraded"
    
    # Check Qdrant
    try:
        await memory_manager.connect()
        status["dependencies"]["qdrant"] = "connected"
    except Exception as e:
        status["dependencies"]["qdrant"] = f"unavailable: {str(e)}"
        status["status"] = "degraded"
    
    return status


@app.get("/metrics")
async def metrics():
    """
    Prometheus metrics endpoint.
    
    Returns metrics in Prometheus text format.
    """
    return PlainTextResponse(
        content=generate_latest().decode('utf-8'),
        media_type=CONTENT_TYPE_LATEST
    )


# Serve static files for Admin UI (production only)
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists() and os.getenv("ENVIRONMENT") == "production":
    from fastapi.responses import FileResponse
    
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the Admin UI SPA for all non-API routes."""
        # Don't serve static files for API routes
        if full_path.startswith(("v1/", "admin/", "health", "metrics")):
            return {"error": "Not found"}, 404
        
        # Serve index.html for all other routes (SPA routing)
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        
        return {"error": "Admin UI not built"}, 404


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
