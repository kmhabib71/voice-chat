@echo off
echo Starting Emotional Voice Assistant...
echo.

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd client
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Starting backend server...
start "Voice Assistant Server" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Starting frontend client...
start "Voice Assistant Client" cmd /k "cd client && npm run dev"

echo.
echo Voice Assistant is starting up!
echo Backend: http://localhost:3002
echo Frontend: http://localhost:3003
echo.
echo Both servers should open in new windows.
echo Close this window when done.
pause