"""
Custom exception classes for the Resume Builder application.
"""
from typing import Any, Dict, Optional


class ResumeBuilderException(Exception):
    """Base exception class for Resume Builder application."""
    
    def __init__(
        self, 
        message: str, 
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(ResumeBuilderException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, field_errors: Optional[Dict[str, str]] = None):
        super().__init__(message, "VALIDATION_ERROR")
        self.field_errors = field_errors or {}


class AuthenticationError(ResumeBuilderException):
    """Raised when authentication fails."""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, "AUTHENTICATION_ERROR")


class AuthorizationError(ResumeBuilderException):
    """Raised when user lacks required permissions."""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, "AUTHORIZATION_ERROR")


class NotFoundError(ResumeBuilderException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, resource: str, resource_id: str = None):
        message = f"{resource} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
        super().__init__(message, "NOT_FOUND_ERROR")
        self.resource = resource
        self.resource_id = resource_id


class ConflictError(ResumeBuilderException):
    """Raised when a resource conflict occurs."""
    
    def __init__(self, message: str):
        super().__init__(message, "CONFLICT_ERROR")


class ExternalServiceError(ResumeBuilderException):
    """Raised when an external service (OpenAI, etc.) fails."""
    
    def __init__(self, service: str, message: str):
        super().__init__(f"{service} service error: {message}", "EXTERNAL_SERVICE_ERROR")
        self.service = service


class DatabaseError(ResumeBuilderException):
    """Raised when database operations fail."""
    
    def __init__(self, message: str, operation: str = None):
        super().__init__(f"Database error: {message}", "DATABASE_ERROR")
        self.operation = operation