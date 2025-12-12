"""Authentication middleware for Cortex."""

import hmac
from typing import Callable, Optional
from fastapi import Request, Response, status, Depends, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from cortex.config import settings
from cortex.observability.metrics import metrics_collector

logger = structlog.get_logger()


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware to validate Bearer token authentication."""
    
    # Paths that don't require authentication
    EXEMPT_PATHS = {"/health", "/health/ready", "/metrics", "/docs", "/openapi.json", "/redoc"}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Validate Bearer token against master key or user API key.
        
        Uses constant-time comparison to prevent timing attacks.
        Returns 401 if authentication fails.
        
        For user API keys, validates against database and attaches user_id to request state.
        """
        # Skip authentication for exempt paths
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)
        
        # Extract Authorization header
        auth_header = request.headers.get("Authorization", "")
        
        if not auth_header.startswith("Bearer "):
            logger.warning("missing_auth_header", path=request.url.path)
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": {
                        "message": "Invalid authentication",
                        "type": "auth_error",
                        "code": "invalid_api_key"
                    }
                }
            )
        
        # Extract token
        token = auth_header[7:]  # Remove "Bearer " prefix
        
        # Check if it's the master key (for admin endpoints)
        expected_master_key = settings.kirio_cortex_master_key
        is_master_key = self._constant_time_compare(token, expected_master_key)
        
        if is_master_key:
            # Master key authentication
            logger.debug("auth_success_master", path=request.url.path)
            request.state.is_admin = True
            request.state.user_id = None
            return await call_next(request)
        
        # Check if it's a user API key (starts with ctx_)
        if token.startswith("ctx_"):
            # Validate against database
            from cortex.database.connection import AsyncSessionLocal
            from cortex.admin.key_service import APIKeyService
            
            async with AsyncSessionLocal() as db:
                api_key = await APIKeyService.validate_key(db, token)
                
                if api_key:
                    # Valid user API key
                    logger.debug(
                        "auth_success_user_key",
                        path=request.url.path,
                        key_id=api_key.id,
                        user_id=api_key.user_id
                    )
                    request.state.is_admin = False
                    request.state.user_id = api_key.user_id
                    request.state.api_key_id = api_key.id
                    
                    # Record metrics
                    metrics_collector.record_api_key_validation("valid")
                    metrics_collector.record_api_key_usage(api_key.id, api_key.user_id)
                    
                    return await call_next(request)
        
        # Invalid token
        logger.warning(
            "invalid_token",
            path=request.url.path,
            token_prefix=token[:12] if len(token) >= 12 else token
        )
        
        # Record invalid authentication
        metrics_collector.record_api_key_validation("invalid")
        
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "message": "Invalid authentication",
                    "type": "auth_error",
                    "code": "invalid_api_key"
                }
            }
        )
    
    @staticmethod
    def _constant_time_compare(a: str, b: str) -> bool:
        """
        Compare two strings in constant time to prevent timing attacks.
        
        Args:
            a: First string
            b: Second string
            
        Returns:
            True if strings are equal, False otherwise
        """
        return hmac.compare_digest(a.encode(), b.encode())


# Dependency for requiring admin authentication
async def require_admin(request: Request) -> bool:
    """
    Dependency that requires admin (master key) authentication.
    
    Usage:
        @app.get("/admin/endpoint")
        async def endpoint(_admin: bool = Depends(require_admin)):
            ...
    
    Raises:
        HTTPException: If not authenticated as admin
    """
    is_admin = getattr(request.state, "is_admin", False)
    
    if not is_admin:
        logger.warning("admin_access_denied", path=request.url.path)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return True


# Dependency for getting current user_id
async def get_current_user_id(request: Request) -> Optional[str]:
    """
    Dependency that extracts the current user_id from the request.
    
    Usage:
        @app.get("/endpoint")
        async def endpoint(user_id: str = Depends(get_current_user_id)):
            ...
    
    Returns:
        User ID if authenticated with user API key, None if master key
    """
    return getattr(request.state, "user_id", None)
