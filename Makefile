.PHONY: dev dev-backend dev-frontend db-up db-down migrate-up migrate-down build clean docker-build docker-run docker-stop

# Development
dev: db-up
	@echo "Starting development servers..."
	@make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && go run cmd/server/main.go

dev-frontend:
	cd frontend && npm run dev

# Database
db-up:
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3

db-down:
	docker-compose down

# Migrations
migrate-up:
	cd backend && go run cmd/server/main.go -migrate-up

migrate-down:
	cd backend && go run cmd/server/main.go -migrate-down

# Build
build-backend:
	cd backend && go build -o bin/server cmd/server/main.go

build-frontend:
	cd frontend && npm run build

build: build-backend build-frontend

# Docker
docker-build:
	docker build -t md-editor:latest .

docker-run: db-up
	docker run -d --name md-editor \
		--network host \
		-e DATABASE_URL="postgres://liuli@192.168.0.151:5432/postgres?sslmode=disable" \
		md-editor:latest
	@echo "Application running at http://localhost:80"

docker-stop:
	docker stop md-editor || true
	docker rm md-editor || true

docker-logs:
	docker logs -f md-editor

# Docker Compose (full stack)
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

# Install dependencies
install:
	cd frontend && npm install
	cd backend && go mod download

# Clean
clean:
	rm -rf backend/bin
	rm -rf frontend/dist
	rm -rf frontend/node_modules

# Lint
lint-backend:
	cd backend && go vet ./...

lint-frontend:
	cd frontend && npm run lint

lint: lint-backend lint-frontend

# Test
test-backend:
	cd backend && go test ./...

test-frontend:
	cd frontend && npm run test:run

test: test-backend test-frontend
