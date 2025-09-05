#!/bin/bash

# Quick Deployment Script for Resume Builder
# This script provides the fastest way to deploy the application

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Resume Builder Quick Deploy${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env exists
if [[ ! -f .env ]]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    if [[ -f .env.example ]]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please update .env with your API keys and configuration${NC}"
    else
        echo -e "${YELLOW}📝 Creating basic .env file...${NC}"
        cat > .env << 'EOF'
# Basic configuration - update with your values
MONGODB_ROOT_PASSWORD=password123
SECRET_KEY=dev-secret-key-change-in-production
OPENAI_API_KEY=your_openai_api_key_here
REDIS_PASSWORD=redis123
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000
EOF
        echo -e "${YELLOW}📝 Please update .env with your actual API keys${NC}"
    fi
fi

echo -e "${BLUE}🔧 Building and starting services...${NC}"

# Build and start services
docker compose up -d --build

echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Health checks
echo -e "${BLUE}🏥 Checking service health...${NC}"

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
fi

# Check frontend
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "Your Resume Builder is now running:"
echo -e "🌐 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "🔧 Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "📚 API Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f          # View logs"
echo "  docker compose ps               # Check status"
echo "  docker compose down             # Stop services"
echo "  docker compose restart          # Restart services"
echo ""
echo -e "${YELLOW}💡 Don't forget to update your .env file with real API keys!${NC}"
