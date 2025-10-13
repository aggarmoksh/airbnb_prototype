#!/bin/bash
# Quick start script for the Airbnb Prototype

echo "🏠 Starting Airbnb Prototype..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is ready"
echo ""

# Ask user if they want AI features
read -p "Do you want to enable AI Agent? (requires Ollama) [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🤖 Starting with AI Agent..."
    docker-compose --profile with-ai up -d
else
    echo "🚀 Starting without AI Agent..."
    docker-compose up -d
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Access the application:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔧 Backend:  http://localhost:4000"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   🤖 AI Agent: http://localhost:8001"
fi
echo ""
echo "📋 Useful commands:"
echo "   View logs:      docker-compose logs -f"
echo "   Stop services:  docker-compose down"
echo "   Restart:        docker-compose restart"
echo ""
echo "Happy coding! 🎉"

