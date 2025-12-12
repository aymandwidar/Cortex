@echo off
echo ========================================
echo Starting Cortex Development Environment
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure your API keys
    pause
    exit /b 1
)

echo [1/3] Starting Backend...
start "Cortex Backend" cmd /k "python -m uvicorn cortex.main:app --reload --port 8080"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting Admin UI...
start "Cortex Admin UI" cmd /k "cd admin-ui && npm run dev"

echo.
echo [3/3] Starting Monitoring Stack (optional)...
docker-compose -f docker-compose.monitoring.yaml up -d

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:    http://localhost:8080
echo Admin UI:   http://localhost:3000
echo Grafana:    http://localhost:3001
echo Prometheus: http://localhost:9090
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
docker-compose -f docker-compose.monitoring.yaml down
taskkill /FI "WINDOWTITLE eq Cortex Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Cortex Admin UI*" /F >nul 2>&1

echo.
echo All services stopped.
pause
