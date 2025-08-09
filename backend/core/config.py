"""
Core configuration settings for the Resume Builder application.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "Resume Builder API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    mongodb_url: str
    database_name: str
    
    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-3.5-turbo"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ]
    
    # Logging
    log_level: str = "INFO"
    
    # Development Settings
    echo_sql: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        

# Global settings instance
settings = Settings()