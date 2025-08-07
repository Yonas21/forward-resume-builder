"""
Global error handlers for the Resume Builder API.
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import logging

from core.exceptions import ResumeBuilderException, ValidationError as CustomValidationError
from schemas.responses import ErrorResponse

logger = logging.getLogger(__name__)


async def resume_builder_exception_handler(request: Request, exc: ResumeBuilderException):
    """Handle custom ResumeBuilder exceptions."""
    logger.error(f"ResumeBuilder exception: {exc.message} - {exc.error_code}")
    
    status_code = 400
    if exc.error_code in ["AUTHENTICATION_ERROR", "AUTHORIZATION_ERROR"]:
        status_code = 401
    elif exc.error_code == "NOT_FOUND_ERROR":
        status_code = 404
    elif exc.error_code == "CONFLICT_ERROR":
        status_code = 409
    elif exc.error_code in ["DATABASE_ERROR", "EXTERNAL_SERVICE_ERROR"]:
        status_code = 500
    
    error_response = ErrorResponse(
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details
    )
    
    if isinstance(exc, CustomValidationError):
        error_response.field_errors = exc.field_errors
    
    return JSONResponse(
        status_code=status_code,
        content=error_response.dict()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    logger.error(f"Validation error: {exc.errors()}")
    
    field_errors = {}
    for error in exc.errors():
        field_name = ".".join(str(loc) for loc in error["loc"])
        field_errors[field_name] = error["msg"]
    
    error_response = ErrorResponse(
        error_code="VALIDATION_ERROR",
        message="Input validation failed",
        field_errors=field_errors
    )
    
    return JSONResponse(
        status_code=422,
        content=error_response.dict()
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTP exceptions."""
    logger.error(f"HTTP exception: {exc.status_code} - {exc.detail}")
    
    error_response = ErrorResponse(
        error_code=f"HTTP_{exc.status_code}",
        message=exc.detail
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    
    error_response = ErrorResponse(
        error_code="INTERNAL_ERROR",
        message="An unexpected error occurred"
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.dict()
    )