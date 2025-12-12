"""Error handling and response formatting."""

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import structlog

logger = structlog.get_logger()


class CortexError(Exception):
    """Base exception for Cortex errors."""
    
    def __init__(self, message: str, error_type: str, code: str, status_code: int = 500):
        self.message = message
        self.error_type = error_type
        self.code = code
        self.status_code = status_code
        super().__init__(message)


def format_error_response(message: str, error_type: str, code: str) -> dict:
    """
    Format error response in OpenAI-compatible format.
    
    Args:
        message: Error message
        error_type: Type of error
        code: Error code
        
    Returns:
        Error response dictionary
    """
    return {
        "error": {
            "message": message,
            "type": error_type,
            "code": code
        }
    }


async def cortex_exception_handler(request: Request, exc: CortexError):
    """Handle Cortex-specific exceptions."""
    logger.error(
        "cortex_error",
        error_type=exc.error_type,
        code=exc.code,
        message=exc.message,
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(exc.message, exc.error_type, exc.code)
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(
        "validation_error",
        errors=exc.errors(),
        path=request.url.path
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=format_error_response(
            "Invalid request format",
            "invalid_request_error",
            "invalid_format"
        )
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    import traceback
    logger.error(
        "unexpected_error",
        error_type=type(exc).__name__,
        error=str(exc),
        path=request.url.path,
        traceback=traceback.format_exc()
    )
    
    # Write to error log file for debugging
    try:
        with open("error_log.txt", "a") as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"UNEXPECTED ERROR in {request.url.path}\n")
            f.write(f"Error Type: {type(exc).__name__}\n")
            f.write(f"Error Message: {str(exc)}\n")
            f.write(f"Traceback:\n")
            f.write(traceback.format_exc())
            f.write(f"\n{'='*80}\n")
    except:
        pass
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            "Internal server error",
            "api_error",
            "internal_error"
        )
    )
