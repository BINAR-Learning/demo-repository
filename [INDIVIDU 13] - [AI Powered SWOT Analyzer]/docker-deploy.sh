#!/bin/bash

# Docker Deployment Script for AI Powered SWOT Analyzer
# Usage: ./docker-deploy.sh [build|start|stop|restart|logs|clean]

set -e

APP_NAME="ai-swot-analyzer"
IMAGE_NAME="swot-analyzer"
CONTAINER_NAME="swot-analyzer-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your GOOGLE_API_KEY"
        else
            print_error ".env.example not found. Please create .env manually"
            exit 1
        fi
    fi
}

build_image() {
    print_status "Building Docker image..."
    docker build -t $IMAGE_NAME .
    print_success "Docker image built successfully"
}

start_container() {
    check_env_file
    print_status "Starting container with docker-compose..."
    docker-compose up -d
    print_success "Container started successfully"
    print_status "Application will be available at: http://localhost:8000"
    print_status "API Documentation at: http://localhost:8000/docs"
}

stop_container() {
    print_status "Stopping container..."
    docker-compose down
    print_success "Container stopped successfully"
}

restart_container() {
    print_status "Restarting container..."
    docker-compose restart
    print_success "Container restarted successfully"
}

show_logs() {
    print_status "Showing container logs..."
    docker-compose logs -f
}

clean_up() {
    print_status "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker image rm $IMAGE_NAME 2>/dev/null || true
    print_success "Cleanup completed"
}

show_help() {
    echo "Docker Deployment Script for AI Powered SWOT Analyzer"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  start     Start the application with docker-compose"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show application logs"
    echo "  clean     Clean up Docker resources"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build && $0 start    # Build and start the application"
    echo "  $0 logs                 # View application logs"
    echo "  $0 clean                # Clean up everything"
}

# Main script logic
case "${1:-help}" in
    build)
        build_image
        ;;
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
