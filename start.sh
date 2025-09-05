#!/bin/bash

# Railway deployment start script
# This script starts the backend application

echo "🚀 Starting Resume Builder Backend..."

# Navigate to backend directory
cd backend

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the FastAPI application
echo "🌟 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
