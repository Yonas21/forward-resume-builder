"""
Main FastAPI application for the Resume Builder.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
import logging
import os

from core.config import settings
from core.exceptions import ResumeBuilderException
from core.error_handlers import (
    resume_builder_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)
from database import init_database, close_database
from routes.auth import router as auth_router
from routes.resumes import router as resume_router
from routes.health import router as health_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    logger.info("Starting application...")
    success = await init_database()
    if not success:
        logger.error("Failed to initialize database")
        raise RuntimeError("Database initialization failed")
    logger.info("Application started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    logger.info("Shutting down application...")
    await close_database()
    logger.info("Application shutdown complete")

# Exception handlers
app.add_exception_handler(ResumeBuilderException, resume_builder_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(health_router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.host, 
        port=settings.port,
        log_level=settings.log_level.lower()
    )