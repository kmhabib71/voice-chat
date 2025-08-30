#!/bin/bash

echo "Starting Emotional Voice Assistant..."
echo

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo "Installing frontend dependencies..."
npm run install:client
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo "Waiting for server to start..."
sleep 5

echo "Starting frontend client..."
npm run dev:client &
FRONTEND_PID=$!

echo
echo "Voice Assistant is running!"
echo "Backend: http://localhost:3002"
echo "Frontend: http://localhost:3003"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID