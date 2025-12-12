@echo off
REM Generate a secure master key for Cortex AI Router (Windows)

echo ======================================================================
echo    Cortex Master Key Generator
echo ======================================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo Generating secure master key...
echo.

REM Generate the key
for /f "delims=" %%i in ('python -c "import secrets; print(secrets.token_urlsafe(32))"') do set NEW_KEY=%%i

echo Generated Master Key:
echo   %NEW_KEY%
echo.
echo Key Length: 43 characters (approx)
echo Entropy: ~256 bits
echo.
echo ======================================================================
echo.
echo To use this key:
echo.
echo 1. Update .env file:
echo    KIRIO_CORTEX_MASTER_KEY=%NEW_KEY%
echo.
echo 2. Restart the backend:
echo    python -m uvicorn cortex.main:app --reload --port 8080
echo.
echo 3. Logout and login to Admin UI with the new key
echo.
echo ======================================================================
echo.
echo Security Reminders:
echo   * Store this key securely
echo   * Never commit it to git
echo   * Use Secret Manager for production
echo   * Rotate every 90 days
echo.
echo ======================================================================
echo.

set /p UPDATE="Do you want to update .env file automatically? (y/n): "
if /i "%UPDATE%"=="y" (
    echo.
    echo Updating .env file...
    
    REM Backup .env
    if exist .env (
        copy .env .env.backup >nul
        echo Created backup: .env.backup
    )
    
    REM Update .env using Python
    python -c "import sys; lines = open('.env').readlines() if __import__('os').path.exists('.env') else []; updated = False; new_lines = []; [new_lines.append(f'KIRIO_CORTEX_MASTER_KEY=%NEW_KEY%\n') if line.startswith('KIRIO_CORTEX_MASTER_KEY=') and not updated and (updated := True) else new_lines.append(line) for line in lines]; new_lines.append(f'\nKIRIO_CORTEX_MASTER_KEY=%NEW_KEY%\n') if not updated else None; open('.env', 'w').writelines(new_lines)"
    
    echo.
    echo Done! .env file updated successfully
    echo.
    echo Next steps:
    echo   1. Restart the backend
    echo   2. Login to Admin UI with new key
    echo.
) else (
    echo.
    echo Skipped .env update. Please update manually.
    echo.
)

pause
