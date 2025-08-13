@echo off
REM Build and run the auth-service with Docker

echo 🚀 Building and running Auth Service with Docker...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo ⚠️  Please update the .env file with your actual configuration values!
    ) else (
        echo ❌ .env.example file not found. Please create .env file manually.
        exit /b 1
    )
)

REM Build the Docker image
echo 📦 Building Docker image...
docker build -t auth-service:latest .

if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker image
    exit /b 1
)

echo ✅ Docker image built successfully!

REM Stop and remove existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Start services with docker-compose
echo 🚀 Starting services with docker-compose...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    exit /b 1
)

echo ✅ Services started successfully!
echo.
echo 📊 Service Status:
docker-compose ps
echo.
echo 🌐 Auth Service will be available at: http://localhost:3001
echo 🗄️  PostgreSQL available at: localhost:5432
echo 📱 Redis available at: localhost:6379
echo.
echo 📝 To view logs: docker-compose logs -f auth-service
echo 🛑 To stop services: docker-compose down
