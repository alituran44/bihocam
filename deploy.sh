#!/bin/bash
set -e

echo "🚀 [BiHocam Deploy] Starting deployment from GitHub (alituran44/bihocam)..."

# Ensure we are in the repository directory
cd "$(dirname "$0")"

# Pull latest changes from main branch
echo "📥 [1/3] Pulling latest code and data from GitHub..."
git pull origin main

# Build and launch containers
echo "🐳 [2/3] Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

# Check container status
echo "🔍 [3/3] Checking running services..."
docker compose -f docker-compose.prod.yml ps

echo "✅ [BiHocam Deploy] Deployment completed successfully!"
