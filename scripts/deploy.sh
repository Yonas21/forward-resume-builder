#!/bin/bash

# Resume Builder Deployment Script
# This script helps deploy the application to various environments

set -e

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

# Function to show usage
show_usage() {
    echo "Resume Builder Deployment Script"
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Deployment environment (dev|staging|production)"
    echo "  -p, --platform PLATFORM  Deployment platform (docker|aws|gcp|digitalocean|vps)"
    echo "  -d, --domain DOMAIN      Domain name for production deployment"
    echo "  -k, --skip-build         Skip building Docker images"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e production -p docker -d myresumebuilder.com"
    echo "  $0 -e staging -p aws"
    echo "  $0 -e dev -p docker"
}

# Default values
ENVIRONMENT="development"
PLATFORM="docker"
DOMAIN=""
SKIP_BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -k|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment. Must be: development, staging, or production"
    exit 1
fi

# Validate platform
if [[ ! "$PLATFORM" =~ ^(docker|aws|gcp|digitalocean|vps)$ ]]; then
    print_error "Invalid platform. Must be: docker, aws, gcp, digitalocean, or vps"
    exit 1
fi

print_status "Starting deployment..."
print_status "Environment: $ENVIRONMENT"
print_status "Platform: $PLATFORM"
if [[ -n "$DOMAIN" ]]; then
    print_status "Domain: $DOMAIN"
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    case $PLATFORM in
        docker)
            if ! command -v docker &> /dev/null; then
                print_error "Docker is not installed"
                exit 1
            fi
            if ! command -v docker-compose &> /dev/null; then
                print_error "Docker Compose is not installed"
                exit 1
            fi
            ;;
        aws)
            if ! command -v aws &> /dev/null; then
                print_error "AWS CLI is not installed"
                exit 1
            fi
            ;;
        gcp)
            if ! command -v gcloud &> /dev/null; then
                print_error "Google Cloud CLI is not installed"
                exit 1
            fi
            ;;
    esac
    
    print_success "Prerequisites check passed"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            cp .env.example .env
            print_warning "Created .env from .env.example"
            print_warning "Please update .env with your actual configuration"
        else
            print_error ".env.example not found"
            exit 1
        fi
    fi
    
    # Update environment-specific settings
    case $ENVIRONMENT in
        production)
            sed -i.bak 's/ENVIRONMENT=development/ENVIRONMENT=production/' .env
            sed -i.bak 's/DEBUG=true/DEBUG=false/' .env
            if [[ -n "$DOMAIN" ]]; then
                sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN|" .env
                sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://$DOMAIN/api|" .env
            fi
            ;;
        staging)
            sed -i.bak 's/ENVIRONMENT=development/ENVIRONMENT=staging/' .env
            ;;
    esac
    
    print_success "Environment files configured"
}

# Docker deployment
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if [[ "$SKIP_BUILD" == false ]]; then
        print_status "Building Docker images..."
        docker compose build
        print_success "Docker images built"
    fi
    
    print_status "Starting services..."
    docker compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
    
    print_success "Docker deployment completed"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:8000"
    print_status "API Docs: http://localhost:8000/docs"
}

# AWS deployment
deploy_aws() {
    print_status "Deploying to AWS..."
    
    # Check if ECR repository exists
    if ! aws ecr describe-repositories --repository-names resume-builder > /dev/null 2>&1; then
        print_status "Creating ECR repository..."
        aws ecr create-repository --repository-name resume-builder
    fi
    
    # Get ECR login token
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
    
    # Build and push image
    ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/resume-builder:latest
    
    print_status "Building and pushing to ECR..."
    docker build -t resume-builder .
    docker tag resume-builder:latest $ECR_URI
    docker push $ECR_URI
    
    print_success "Image pushed to ECR: $ECR_URI"
    print_warning "Please configure your AWS services (ECS, App Runner, etc.) to use this image"
}

# Google Cloud deployment
deploy_gcp() {
    print_status "Deploying to Google Cloud..."
    
    PROJECT_ID=$(gcloud config get-value project)
    if [[ -z "$PROJECT_ID" ]]; then
        print_error "No Google Cloud project set. Run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    print_status "Building and pushing to Google Container Registry..."
    docker build -t gcr.io/$PROJECT_ID/resume-builder .
    docker push gcr.io/$PROJECT_ID/resume-builder
    
    print_status "Deploying to Cloud Run..."
    gcloud run deploy resume-builder \
        --image gcr.io/$PROJECT_ID/resume-builder \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated
    
    print_success "Deployed to Cloud Run"
}

# DigitalOcean deployment
deploy_digitalocean() {
    print_status "Deploying to DigitalOcean..."
    
    if [[ ! -f app.yaml ]]; then
        print_error "app.yaml not found. Please create DigitalOcean App Platform configuration"
        exit 1
    fi
    
    print_status "Deploying to DigitalOcean App Platform..."
    doctl apps create --spec app.yaml
    
    print_success "Deployed to DigitalOcean App Platform"
}

# VPS deployment
deploy_vps() {
    print_status "Deploying to VPS..."
    
    print_warning "VPS deployment requires manual setup. Please follow these steps:"
    echo "1. Install Docker and Docker Compose on your VPS"
    echo "2. Copy your application files to the VPS"
    echo "3. Update .env with production values"
    echo "4. Run: docker compose up -d"
    echo "5. Setup reverse proxy (Nginx) and SSL certificates"
    
    print_status "Creating deployment package..."
    tar -czf resume-builder-deploy.tar.gz \
        --exclude=node_modules \
        --exclude=venv \
        --exclude=.git \
        --exclude=*.log \
        .
    
    print_success "Deployment package created: resume-builder-deploy.tar.gz"
    print_status "Upload this file to your VPS and extract it"
}

# Main deployment function
main() {
    check_prerequisites
    setup_environment
    
    case $PLATFORM in
        docker)
            deploy_docker
            ;;
        aws)
            deploy_aws
            ;;
        gcp)
            deploy_gcp
            ;;
        digitalocean)
            deploy_digitalocean
            ;;
        vps)
            deploy_vps
            ;;
    esac
    
    print_success "🎉 Deployment completed successfully!"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        print_warning "Production deployment checklist:"
        echo "- [ ] Update DNS records to point to your server"
        echo "- [ ] Setup SSL certificates"
        echo "- [ ] Configure monitoring and alerts"
        echo "- [ ] Setup database backups"
        echo "- [ ] Test all functionality"
        echo "- [ ] Update API keys and secrets"
    fi
}

# Run main function
main
