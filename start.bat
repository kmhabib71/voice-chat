@echo off
title AI Voice Assistant - Next.js + Socket.io

echo ====================================================
echo   AI Voice Assistant - Next.js + Socket.io
echo   Starting Backend Server and Next.js Frontend
echo ====================================================
echo.

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo Installing Next.js frontend dependencies...
cd client-nextjs
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install Next.js dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Starting servers...
echo Backend: Socket.io server on http://localhost:3002
echo Frontend: Next.js client on http://localhost:3003
echo.

echo Starting backend server...
start "AI Voice Assistant - Backend" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Starting Next.js frontend...
start "AI Voice Assistant - Frontend" cmd /k "cd client-nextjs && npx next dev -p 3003"

echo.
echo ====================================================
echo   AI Voice Assistant is starting up!
echo   Backend: http://localhost:3002 (Socket.io)
echo   Frontend: http://localhost:3003 (Next.js + Tailwind)
echo ====================================================
echo.
echo Both servers are opening in new windows.
echo.
echo Features:
echo - Modern Next.js frontend with Tailwind CSS
echo - Socket.io real-time communication
echo - TypeScript for better development
echo - SEO optimized with meta tags
echo - Responsive design for all devices
echo.
echo Opening application in browser...
timeout /t 3 /nobreak > nul
start http://localhost:3003

echo.
echo Close this window when done.
pause