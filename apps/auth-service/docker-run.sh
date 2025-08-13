#!/bin/bash

# Build and run the auth-service with Docker

set -e  # Exit on any error

echo "🚀 Building and running Auth Service with Docker..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please update the .env file with your actual configuration values!"
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Build the Docker image
print_status "Building Docker image..."
docker build -t auth-service:latest .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully!"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Stop and remove existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start services with docker-compose
print_status "Starting services with docker-compose..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_success "Services started successfully!"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "🌐 Auth Service will be available at: http://localhost:3001"
    echo "🗄️  PostgreSQL available at: localhost:5432"
    echo "📱 Redis available at: localhost:6379"
    echo ""
    echo "📝 To view logs: docker-compose logs -f auth-service"
    echo "🛑 To stop services: docker-compose down"
else
    print_error "Failed to start services"
    exit 1
fi
