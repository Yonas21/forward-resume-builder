# Makefile for Resume Builder
# Provides convenient commands for development, testing, and deployment

.PHONY: help install dev test lint format clean build docker-build docker-up docker-down deploy

# Default target
help: ## Show this help message
	@echo "Resume Builder - Available Commands"
	@echo "=================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development Setup
install: ## Install all dependencies
	@echo "🔧 Installing dependencies..."
	@chmod +x scripts/setup-dev.sh
	@./scripts/setup-dev.sh

install-backend: ## Install backend dependencies only
	@echo "🐍 Installing Python dependencies..."
	@cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

install-frontend: ## Install frontend dependencies only
	@echo "⚛️ Installing Node.js dependencies..."
	@cd frontend && npm install

# Development
dev: ## Start development servers
	@echo "🚀 Starting development environment..."
	@chmod +x scripts/start-dev.sh
	@./scripts/start-dev.sh

dev-backend: ## Start backend development server only
	@echo "🐍 Starting backend server..."
	@cd backend && source venv/bin/activate && python main.py

dev-frontend: ## Start frontend development server only
	@echo "⚛️ Starting frontend server..."
	@cd frontend && npm run dev

# Testing
test: ## Run all tests
	@echo "🧪 Running all tests..."
	@chmod +x scripts/test-all.sh
	@./scripts/test-all.sh

test-backend: ## Run backend tests only
	@echo "🐍 Running backend tests..."
	@cd backend && source venv/bin/activate && pytest --cov=. --cov-report=html --cov-report=term

test-frontend: ## Run frontend tests only
	@echo "⚛️ Running frontend tests..."
	@cd frontend && npm test -- --coverage --watchAll=false

test-integration: ## Run integration tests
	@echo "🔗 Running integration tests..."
	@docker compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit
	@docker compose down -v

# Code Quality
lint: ## Run linting on all code
	@echo "🔍 Running linters..."
	@$(MAKE) lint-backend
	@$(MAKE) lint-frontend

lint-backend: ## Run Python linting
	@echo "🐍 Linting Python code..."
	@cd backend && source venv/bin/activate && flake8 . && mypy . --ignore-missing-imports

lint-frontend: ## Run JavaScript/TypeScript linting
	@echo "⚛️ Linting frontend code..."
	@cd frontend && npm run lint

format: ## Format all code
	@echo "✨ Formatting code..."
	@$(MAKE) format-backend
	@$(MAKE) format-frontend

format-backend: ## Format Python code
	@echo "🐍 Formatting Python code..."
	@cd backend && source venv/bin/activate && black . && isort .

format-frontend: ## Format frontend code
	@echo "⚛️ Formatting frontend code..."
	@cd frontend && npx prettier --write .

# Security
security-check: ## Run security checks
	@echo "🔒 Running security checks..."
	@cd backend && source venv/bin/activate && bandit -r . -x tests/
	@cd frontend && npm audit --audit-level=moderate

# Pre-commit
precommit-install: ## Install pre-commit hooks
	@echo "🪝 Installing pre-commit hooks..."
	@pip install pre-commit
	@pre-commit install

precommit-run: ## Run pre-commit on all files
	@echo "🪝 Running pre-commit checks..."
	@pre-commit run --all-files

# Build
build: ## Build production artifacts
	@echo "🏗️ Building production artifacts..."
	@$(MAKE) build-backend
	@$(MAKE) build-frontend

build-backend: ## Build backend for production
	@echo "🐍 Building backend..."
	@cd backend && source venv/bin/activate && pip install --upgrade pip setuptools wheel

build-frontend: ## Build frontend for production
	@echo "⚛️ Building frontend..."
	@cd frontend && npm run build

# Docker
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	@docker compose build

docker-up: ## Start all services with Docker
	@echo "🐳 Starting Docker services..."
	@docker compose up -d

docker-down: ## Stop all Docker services
	@echo "🐳 Stopping Docker services..."
	@docker compose down

docker-logs: ## Show Docker logs
	@echo "🐳 Showing Docker logs..."
	@docker compose logs -f

docker-clean: ## Clean Docker resources
	@echo "🐳 Cleaning Docker resources..."
	@docker compose down -v --remove-orphans
	@docker system prune -f

# Database
db-setup: ## Setup database
	@echo "🗄️ Setting up database..."
	@docker compose up -d mongodb redis
	@sleep 10
	@echo "Database services started"

db-reset: ## Reset database
	@echo "🗄️ Resetting database..."
	@docker compose down -v mongodb redis
	@docker compose up -d mongodb redis
	@sleep 10
	@echo "Database reset complete"

# Deployment
deploy-staging: ## Deploy to staging
	@echo "🚀 Deploying to staging..."
	@echo "Staging deployment not configured yet"

deploy-production: ## Deploy to production
	@echo "🚀 Deploying to production..."
	@echo "Production deployment not configured yet"

# Utilities
clean: ## Clean build artifacts and caches
	@echo "🧹 Cleaning up..."
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type d -name "*.egg-info" -exec rm -rf {} +
	@rm -rf backend/htmlcov backend/.coverage
	@rm -rf frontend/dist frontend/build frontend/coverage
	@rm -rf test-results
	@echo "Cleanup complete"

logs: ## Show application logs
	@echo "📋 Showing logs..."
	@tail -f backend/logs/app.log || echo "No backend logs found"

health-check: ## Check application health
	@echo "🏥 Checking application health..."
	@curl -f http://localhost:8000/health || echo "Backend not responding"
	@curl -f http://localhost:3000/health || echo "Frontend not responding"

# Documentation
docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	@echo "Documentation generation not implemented yet"

# Environment
env-check: ## Check environment configuration
	@echo "🔧 Checking environment..."
	@python --version
	@node --version
	@docker --version || echo "Docker not installed"
	@echo "Environment check complete"

# Quick commands
quick-start: install docker-up ## Quick start (install + docker up)
	@echo "🚀 Quick start complete!"

full-test: lint test security-check ## Run all quality checks
	@echo "✅ All quality checks complete!"

# Development workflow
workflow: format lint test ## Run development workflow (format, lint, test)
	@echo "✅ Development workflow complete!"