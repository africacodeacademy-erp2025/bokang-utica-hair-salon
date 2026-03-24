#!/bin/bash

# Production Deployment Script for Bokang Utica Hair Salon
# This script builds and deploys the application for production

set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Build the containers
echo "🔨 Building Docker containers..."
docker-compose build --no-cache

# Start the containers
echo "▶️  Starting production containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health checks
echo "🔍 Running health checks..."

# Check frontend
if curl -f -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check email server
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Email server is healthy"
else
    echo "❌ Email server health check failed"
fi

echo "🎉 Deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Email API: http://localhost:3000/api/send-booking-confirmation"
echo "   Email Health: http://localhost:3000/api/health"
echo ""
echo "📧 Email Status:"
if grep -q "EMAIL_HOST" .env && grep -q "EMAIL_USER" .env && grep -q "EMAIL_PASS" .env; then
    echo "   ✅ SMTP configured - Real emails enabled"
else
    echo "   🧪 Test mode - Emails logged to console only"
    echo "   To enable real emails, add EMAIL_HOST, EMAIL_USER, EMAIL_PASS to .env"
fi