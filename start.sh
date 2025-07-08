#!/bin/bash

# ePrompt Backend Startup Script
# This script activates the virtual environment and starts the FastAPI server

echo "🚀 Starting ePrompt Backend API..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run: python -m venv .venv"
    exit 1
fi

# Activate virtual environment and run the application
source .venv/bin/activate
python app/main.py
