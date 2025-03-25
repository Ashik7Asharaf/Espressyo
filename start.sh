#!/bin/bash

# Kill any existing processes
pkill -f "expo"
pkill -f "node"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if required commands exist
if ! command_exists node; then
  echo "Error: Node.js is not installed"
  exit 1
fi

if ! command_exists npm; then
  echo "Error: npm is not installed"
  exit 1
fi

# Start the server
cd server
npm install
npm run dev &

# Wait for server to start
sleep 5

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Error: Server failed to start"
  exit 1
fi

# Start the app
cd ..
npm install
npx expo start --clear 