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

# Function to check if port is available
check_port() {
    port=$1
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -an | grep ":$port " | grep LISTEN >/dev/null 2>&1; then
            return 1
        fi
    fi
    return 0
}

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup INT TERM EXIT


echo "🔧 Running in DEVELOPMENT mode"
echo ""

# Check if required ports are available
echo "🔍 Checking port availability..."

if ! check_port 3000; then
    echo "❌ Port 3000 is already in use. Please free it and try again."
    exit 1
fi

if ! check_port 5173; then
    echo "❌ Port 5173 is already in use. Please free it and try again."
    exit 1
fi

echo "✅ Ports 3000 and 5173 are available"
echo ""

# Validate environment variables
echo "🔐 Validating environment configuration..."

if [ -z "$MACHAAO_API_TOKEN" ] || [ -z "$MACHAAO_DEVELOPER_TOKEN" ] || [ -z "$MACHAAO_APP_ID" ]; then
    echo "⚠️  Warning: MACHAAO credentials not fully configured in .env"
    echo "   The app may not function correctly without proper credentials"
else
    echo "✅ MACHAAO credentials configured"
fi
echo ""

# Start backend server in background
echo "🎯 Starting backend API server on port 3000..."
node server/index.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend server failed to start. Check /tmp/backend.log for errors."
    exit 1
fi

echo "✅ Backend server started (PID: $BACKEND_PID)"
echo ""

# Start frontend server in background
echo "🎨 Starting frontend dev server on port 5173..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend server failed to start. Check /tmp/frontend.log for errors."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend server started (PID: $FRONTEND_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All services started successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:3000"
echo "💚 Health:    http://localhost:3000/health"
echo ""
echo "📋 Logs:"
echo "   Backend:  /tmp/backend.log"
echo "   Frontend: /tmp/frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Keep script running and wait for both processes
wait $BACKEND_PID $FRONTEND_PID