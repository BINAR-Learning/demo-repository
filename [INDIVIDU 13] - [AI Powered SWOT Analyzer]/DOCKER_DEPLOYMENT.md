# Docker Deployment Guide

## 🐳 Docker Deployment for AI Powered SWOT Analyzer

This guide explains how to deploy the AI Powered SWOT Analyzer using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- 2GB+ available disk space
- Internet connection for image building

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Google API key
nano .env  # or use your preferred editor
```

### 2. Build and Deploy
```bash
# Make deployment script executable
chmod +x docker-deploy.sh

# Build the Docker image
./docker-deploy.sh build

# Start the application
./docker-deploy.sh start
```

### 3. Access the Application
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠 Deployment Commands

### Using Deployment Script (Recommended)
```bash
# Build Docker image
./docker-deploy.sh build

# Start application
./docker-deploy.sh start

# View logs
./docker-deploy.sh logs

# Stop application
./docker-deploy.sh stop

# Restart application
./docker-deploy.sh restart

# Clean up resources
./docker-deploy.sh clean

# Show help
./docker-deploy.sh help
```

### Manual Docker Commands
```bash
# Build image
docker build -t swot-analyzer .

# Run container
docker run -d \
  --name swot-analyzer-app \
  -p 8000:8000 \
  -e GOOGLE_API_KEY="your-api-key" \
  -v $(pwd)/swot_history.json:/app/swot_history.json \
  -v $(pwd)/exports:/app/exports \
  swot-analyzer

# View logs
docker logs -f swot-analyzer-app

# Stop container
docker stop swot-analyzer-app
docker rm swot-analyzer-app
```

### Using Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

## 📁 Volume Mounts

The container uses the following volume mounts:

| Host Path | Container Path | Purpose |
|-----------|----------------|---------|
| `./swot_history.json` | `/app/swot_history.json` | Persistent data storage |
| `./exports` | `/app/exports` | Excel export files |
| `./logs` | `/app/logs` | Application logs |

## 🔧 Configuration

### Environment Variables
```bash
# Required
GOOGLE_API_KEY=your-gemini-api-key

# Optional
PYTHONPATH=/app
PORT=8000
```

### Docker Compose Override
Create `docker-compose.override.yml` for custom configurations:
```yaml
version: '3.8'
services:
  swot-analyzer:
    ports:
      - "9000:8000"  # Custom port
    environment:
      - DEBUG=true   # Custom environment
```

## 🏥 Health Monitoring

### Health Check Endpoint
```bash
# Check application health
curl http://localhost:8000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-08-01T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "ai_service": "operational",
    "db_service": "operational"
  }
}
```

### Container Health Status
```bash
# Check container health
docker ps
# Look for "healthy" status

# View health check logs
docker inspect swot-analyzer-app | grep -A 20 "Health"
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
./docker-deploy.sh logs

# Common causes:
# - Missing GOOGLE_API_KEY
# - Port 8000 already in use
# - Insufficient disk space
```

#### 2. API Key Issues
```bash
# Verify environment variables
docker exec swot-analyzer-app env | grep GOOGLE

# Update API key
docker-compose down
# Edit .env file
docker-compose up -d
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./swot_history.json ./exports ./logs

# Restart container
docker-compose restart
```

#### 4. Port Conflicts
```bash
# Check what's using port 8000
lsof -i :8000

# Use different port in docker-compose.yml
ports:
  - "9000:8000"
```

### Debugging Commands
```bash
# Execute shell in container
docker exec -it swot-analyzer-app /bin/bash

# Check container resources
docker stats swot-analyzer-app

# Inspect container configuration
docker inspect swot-analyzer-app

# View Docker system information
docker system df
docker system prune  # Clean up unused resources
```

## 🚀 Production Deployment

### 1. Reverse Proxy Setup (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. SSL/TLS Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Resource Limits
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  swot-analyzer:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 4. Monitoring Setup
```yaml
# Add monitoring service
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

## 📊 Performance Optimization

### 1. Multi-stage Build
```dockerfile
# Already implemented in Dockerfile
FROM python:3.11-slim as base
# ... optimized build stages
```

### 2. Resource Monitoring
```bash
# Monitor container resources
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Monitor application metrics
curl http://localhost:8000/metrics
```

### 3. Scaling Options
```bash
# Scale with Docker Compose
docker-compose up -d --scale swot-analyzer=3

# Use Docker Swarm for clustering
docker swarm init
docker stack deploy -c docker-compose.yml swot-stack
```

## 🔐 Security Best Practices

### 1. Container Security
- ✅ Non-root user implementation
- ✅ Minimal base image (Python slim)
- ✅ Health checks enabled
- ✅ Environment variable security

### 2. Network Security
```bash
# Create custom network
docker network create swot-network

# Run with custom network
docker-compose --network swot-network up -d
```

### 3. Secrets Management
```bash
# Use Docker secrets (Swarm mode)
echo "your-api-key" | docker secret create google_api_key -

# Reference in compose file
secrets:
  - google_api_key
```

## 📝 Maintenance

### Regular Tasks
```bash
# Update base image
docker pull python:3.11-slim
./docker-deploy.sh build

# Clean up old images
docker system prune -f

# Backup data
tar -czf backup-$(date +%Y%m%d).tar.gz swot_history.json exports/

# Update application
git pull
./docker-deploy.sh build
./docker-deploy.sh restart
```

### Log Rotation
```yaml
# Add to docker-compose.yml
services:
  swot-analyzer:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🎯 Summary

The Docker deployment provides:
- ✅ **Easy deployment** with single command
- ✅ **Production-ready** configuration
- ✅ **Health monitoring** and auto-restart
- ✅ **Volume persistence** for data
- ✅ **Security hardening** with non-root user
- ✅ **Scalability** options available

Your AI Powered SWOT Analyzer is now ready for containerized deployment! 🚀
