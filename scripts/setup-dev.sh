#!/bin/bash

# Development Setup Script for Resume Builder
# This script sets up the development environment

set -e

echo "🚀 Setting up Resume Builder development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work."
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Copy main .env file
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please update .env with your actual API keys and configuration"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Setup backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << 'EOF'
MONGODB_URL=mongodb://admin:password123@localhost:27017/resume_builder?authSource=admin
DATABASE_NAME=resume_builder
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
REDIS_URL=redis://:redis123@localhost:6379/0
PORT=8000
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
        print_success "Created backend/.env file"
    fi
    
    # Setup frontend .env
    if [ ! -f frontend/.env ]; then
        echo "VITE_API_BASE_URL=http://localhost:8000" > frontend/.env
        print_success "Created frontend/.env file"
    fi
}

# Setup Python backend
setup_backend() {
    print_status "Setting up Python backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Created Python virtual environment"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install dependencies
    pip install -r requirements.txt
    print_success "Installed Python dependencies"
    
    # Install development dependencies
    pip install black isort flake8 mypy bandit pytest pytest-cov pytest-asyncio httpx
    print_success "Installed Python development dependencies"
    
    cd ..
}

# Setup Node.js frontend
setup_frontend() {
    print_status "Setting up Node.js frontend..."
    
    cd frontend
    
    # Install dependencies
    npm install
    print_success "Installed Node.js dependencies"
    
    cd ..
}

# Setup pre-commit hooks
setup_precommit() {
    print_status "Setting up pre-commit hooks..."
    
    # Install pre-commit
    pip install pre-commit
    
    # Install hooks
    pre-commit install
    print_success "Pre-commit hooks installed"
    
    # Run hooks on all files (optional)
    print_status "Running pre-commit on all files..."
    pre-commit run --all-files || print_warning "Some pre-commit checks failed. Please fix them manually."
}

# Setup Docker environment
setup_docker() {
    if command -v docker &> /dev/null; then
        print_status "Setting up Docker environment..."
        
        # Create necessary directories
        mkdir -p backend/uploads backend/logs
        mkdir -p test-results
        
        # Build images
        print_status "Building Docker images..."
        docker compose build
        print_success "Docker images built successfully"
        
        print_status "Starting services..."
        docker compose up -d mongodb redis
        print_success "Database services started"
        
        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 10
        
        print_success "Docker environment ready!"
    else
        print_warning "Docker not available, skipping Docker setup"
    fi
}

# Create development scripts
create_scripts() {
    print_status "Creating development scripts..."
    
    # Create start script
    cat > scripts/start-dev.sh << 'EOF'
#!/bin/bash
echo "Starting Resume Builder development environment..."

# Start backend
echo "Starting backend..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend running at: http://localhost:8000"
echo "Frontend running at: http://localhost:5173"
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
EOF
    
    chmod +x scripts/start-dev.sh
    print_success "Created start-dev.sh script"
    
    # Create test script
    cat > scripts/test-all.sh << 'EOF'
#!/bin/bash
echo "Running all tests..."

# Backend tests
echo "Running backend tests..."
cd backend
source venv/bin/activate
pytest --cov=. --cov-report=html --cov-report=term
cd ..

# Frontend tests
echo "Running frontend tests..."
cd frontend
npm test -- --coverage --watchAll=false
cd ..

echo "All tests completed!"
EOF
    
    chmod +x scripts/test-all.sh
    print_success "Created test-all.sh script"
}

# Main setup function
main() {
    echo "🏗️  Resume Builder Development Setup"
    echo "=================================="
    
    check_requirements
    setup_env_files
    setup_backend
    setup_frontend
    setup_precommit
    setup_docker
    create_scripts
    
    print_success "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env files with actual API keys"
    echo "2. Run './scripts/start-dev.sh' to start development servers"
    echo "3. Visit http://localhost:5173 for the frontend"
    echo "4. Visit http://localhost:8000/docs for API documentation"
    echo ""
    echo "Useful commands:"
    echo "- ./scripts/start-dev.sh    # Start development servers"
    echo "- ./scripts/test-all.sh     # Run all tests"
    echo "- docker compose up         # Start with Docker"
    echo "- pre-commit run --all-files # Run code quality checks"
}

# Run main function
main "$@"