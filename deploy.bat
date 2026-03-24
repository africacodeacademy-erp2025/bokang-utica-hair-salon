@echo off
REM Production Deployment Script for Bokang Utica Hair Salon (Windows)
REM This script builds and deploys the application for production

echo 🚀 Starting production deployment...

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo Please copy .env.example to .env and configure your environment variables.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down >nul 2>&1

REM Build the containers
echo 🔨 Building Docker containers...
docker-compose build --no-cache

REM Start the containers
echo ▶️  Starting production containers...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Health checks
echo 🔍 Running health checks...

REM Check frontend
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 10 | Out-Null; echo '✅ Frontend is healthy' } catch { echo '❌ Frontend health check failed' }"

REM Check email server
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 10 | Out-Null; echo '✅ Email server is healthy' } catch { echo '❌ Email server health check failed' }"

echo 🎉 Deployment complete!
echo.
echo 📊 Service URLs:
echo    Frontend: http://localhost:5173
echo    Email API: http://localhost:3000/api/send-booking-confirmation
echo    Email Health: http://localhost:3000/api/health
echo.
echo 📧 Email Status:
findstr "EMAIL_HOST" .env >nul && findstr "EMAIL_USER" .env >nul && findstr "EMAIL_PASS" .env >nul && (
    echo    ✅ SMTP configured - Real emails enabled
) || (
    echo    🧪 Test mode - Emails logged to console only
    echo    To enable real emails, add EMAIL_HOST, EMAIL_USER, EMAIL_PASS to .env
)

pause