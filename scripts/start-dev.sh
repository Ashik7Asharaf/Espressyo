#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting development environment..."

# Kill any existing processes on ports 3000 and 8081
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start the server
echo "📦 Starting server..."
cd server && npm run dev &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Start the Expo app
echo "📱 Starting Expo app..."
cd .. && npx expo start --clear

# Trap SIGINT to kill background processes
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT 