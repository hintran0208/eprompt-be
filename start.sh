#!/bin/bash

# ePrompt Backend Startup Script
# This script starts the Node.js Express server

echo "🚀 Starting ePrompt Backend API..."

# Check if node_modules exists in prompt-engine
if [ ! -d "prompt-engine/node_modules" ]; then
    echo "❌ Node modules not found. Installing dependencies..."
    cd prompt-engine && npm install
    cd ..
fi

# Build the TypeScript project if dist folder doesn't exist
if [ ! -d "prompt-engine/dist" ]; then
    echo "🔨 Building TypeScript project..."
    cd prompt-engine && npm run build
    cd ..
fi

# Start the application
echo "🎯 Starting Express server..."
cd prompt-engine && npm start
