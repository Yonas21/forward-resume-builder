"""
Common validation utilities for the Resume Builder application.
"""
import re
from typing import Any


def validate_password(password: str) -> str:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        
    Returns:
        The validated password
        
    Raises:
        ValueError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise ValueError('Password must be at least 8 characters long')
    if not re.search(r'[A-Za-z]', password):
        raise ValueError('Password must contain at least one letter')
    if not re.search(r'\d', password):
        raise ValueError('Password must contain at least one digit')
    return password


def validate_email_format(email: str) -> str:
    """
    Validate email format using regex.
    
    Args:
        email: Email to validate
        
    Returns:
        The validated email
        
    Raises:
        ValueError: If email format is invalid
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, str(email)):
        raise ValueError('Invalid email format')
    return email