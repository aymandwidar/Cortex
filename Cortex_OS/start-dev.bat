@echo off
echo 🚀 Starting Cortex OS Development Environment...

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Please run this script from the Cortex_OS root directory
    pause
    exit /b 1
)

REM Check dependencies
echo 🔍 Checking dependencies...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Dependencies check passed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
)
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo ✅ Dependencies installed successfully

REM Start services
echo 🌟 Starting Cortex OS services...

REM Start backend
echo 🔧 Starting backend server...
cd backend
start "Cortex Backend" cmd /k "venv\Scripts\activate.bat && python main.py"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend development server...
cd frontend
start "Cortex Frontend" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 Cortex OS is starting up!
echo.
echo 📍 Services:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    Health:   http://localhost:8000/health
echo.
echo 🛑 Close the terminal windows to stop the services
echo.
pause