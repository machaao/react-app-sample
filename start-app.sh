#!/bin/sh
# MACHAAO Todo App Startup Script
# POSIX compatible startup script for local and cloud deployment

echo "🚀 Starting MACHAAO Todo App..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using .env.example as template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
    fi
fi

# Build frontend for production if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "🔨 Building frontend..."
    npm run build
fi

# Start the Express server (serves both API and static files)
echo "🎯 Starting server on port ${PORT:-3000}..."
exec node server/index.js
