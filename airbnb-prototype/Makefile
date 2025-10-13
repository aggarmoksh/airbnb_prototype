.PHONY: help build up down logs clean restart rebuild

help: ## Show this help message
	@echo "🏠 Airbnb Prototype - Docker Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose build

up: ## Start all services (without AI)
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "🌐 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:4000"
	@echo "📊 MySQL: localhost:3307"

up-ai: ## Start all services (with AI agent)
	docker-compose --profile with-ai up -d
	@echo "✅ Services started with AI!"
	@echo "🌐 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:4000"
	@echo "🤖 AI Agent: http://localhost:8001"
	@echo "📊 MySQL: localhost:3307"

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-server: ## View server logs
	docker-compose logs -f server

logs-client: ## View client logs
	docker-compose logs -f client

logs-ai: ## View AI agent logs
	docker-compose logs -f ai-agent

clean: ## Remove all containers, volumes, and images
	docker-compose down -v
	docker system prune -f

restart: ## Restart all services
	docker-compose restart

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

status: ## Show status of all services
	docker-compose ps

db-shell: ## Access MySQL shell
	docker exec -it airbnb-mysql mysql -u root -ppass123 airbnb_dev

db-migrate: ## Run database migrations
	docker-compose exec server npx prisma migrate deploy

dev: ## Start in development mode (no Docker)
	@echo "Starting development servers..."
	@echo "Run these commands in separate terminals:"
	@echo "1. cd server && npm run dev"
	@echo "2. cd client && npm run dev"
	@echo "3. cd ai-agent && uvicorn main:app --reload --port 8001"

