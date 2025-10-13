@echo off
REM Quick start script for Windows

echo Starting Airbnb Prototype...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Docker is ready
echo.

REM Ask user about AI features
set /p AI="Do you want to enable AI Agent? (requires Ollama) [y/N]: "

if /i "%AI%"=="y" (
    echo Starting with AI Agent...
    docker-compose --profile with-ai up -d
) else (
    echo Starting without AI Agent...
    docker-compose up -d
)

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo All services started!
echo.
echo Access the application:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:4000
if /i "%AI%"=="y" echo    AI Agent: http://localhost:8001
echo.
echo Useful commands:
echo    View logs:      docker-compose logs -f
echo    Stop services:  docker-compose down
echo    Restart:        docker-compose restart
echo.
echo Happy coding!
pause

