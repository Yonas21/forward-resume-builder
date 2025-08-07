#!/usr/bin/env python3
"""
Database setup script for Resume Builder
Run this script to initialize the MongoDB database with required collections and indexes.

Usage:
    python setup_db.py

Requirements:
    - MongoDB server running locally or accessible via MONGODB_URL env var
    - All dependencies installed: pip install -r requirements.txt
"""

import asyncio
import logging
from database import init_database, check_database_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def setup_database():
    """Initialize the database with collections and indexes"""
    try:
        logger.info("Starting database setup...")
        
        # Initialize database connection
        success = await init_database()
        if not success:
            logger.error("Failed to initialize database")
            return False
        
        # Check connection
        is_connected = await check_database_connection()
        if not is_connected:
            logger.error("Database connection failed")
            return False
        
        logger.info("Database setup completed successfully!")
        logger.info("Collections created:")
        logger.info("  - users (for user accounts)")
        logger.info("  - resumes (for resume data)")
        logger.info("  - resume_versions (for version history)")
        logger.info("")
        logger.info("Next steps:")
        logger.info("1. Make sure MongoDB is running")
        logger.info("2. Set MONGODB_URL environment variable if using remote MongoDB")
        logger.info("3. Start the FastAPI server: python main.py")
        logger.info("")
        return True
        
    except Exception as e:
        logger.error(f"Database setup failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(setup_database())
    exit(0 if success else 1)