"""
Health check routes for the Resume Builder API.
"""
from fastapi import APIRouter
from datetime import datetime
import logging

from schemas.responses import HealthResponse
from database import check_database_connection

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        db_healthy = await check_database_connection()
        return HealthResponse(
            status="healthy" if db_healthy else "unhealthy",
            database="connected" if db_healthy else "disconnected",
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="unhealthy",
            database="error",
            timestamp=datetime.utcnow(),
            error=str(e)
        )