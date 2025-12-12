@echo off
echo 🚀 Starting Cortex V2 Production Environment
echo ============================================

echo.
echo 📋 System Information:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3004  
echo - Admin Password: ad222333
echo - Health Monitor: Enabled
echo.

echo 🔧 Starting Backend Health Monitor...
start "Cortex Backend Monitor" python keep-backend-alive.py

echo.
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo.
echo 🌐 Starting Frontend...
cd admin-ui
start "Cortex Frontend" npm run dev

echo.
echo ✅ Cortex V2 Production Environment Started!
echo.
echo 📱 Access URLs:
echo - Admin Dashboard: http://localhost:3004/
echo - API Playground: http://localhost:3004/playground
echo - Health Check: http://localhost:8000/health
echo.
echo 🔑 Admin Login: ad222333
echo.
echo 📊 Monitor Windows:
echo - Backend Monitor: Check the "Cortex Backend Monitor" window
echo - Frontend Server: Check the "Cortex Frontend" window
echo.
echo Press any key to view system status...
pause > nul

echo.
echo 🧪 Testing System Health...
python test_my_api_key.py

echo.
echo 🎉 System Ready! Press any key to exit...
pause > nul