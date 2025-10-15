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
        echo "⚠️  Please update .env with your MACHAAO credentials before deploying"
    fi
fi

# Determine environment
NODE_ENV=${NODE_ENV:-production}

if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in PRODUCTION mode"
    
    # Build frontend for production if dist doesn't exist or is outdated
    if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
        echo "🔨 Building frontend..."
        npm run build
    else
        echo "✅ Frontend already built"
    fi
    
    # Start the Express server (serves both API and static files)
    echo "🎯 Starting production server on port ${PORT:-3000}..."
    exec node server/index.js
else
    echo "🔧 Running in DEVELOPMENT mode"
    echo ""
    echo "📝 For development, you need to run TWO servers:"
    echo "   Terminal 1: npm run dev:server  (Backend API on port 3000)"
    echo "   Terminal 2: npm run dev         (Frontend on port 5173)"
    echo ""
    echo "🎯 Starting backend API server on port ${PORT:-3000}..."
    exec node server/index.js
fi
