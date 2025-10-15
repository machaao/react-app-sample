#!/bin/sh
# MACHAAO Platform deployment script for React Todo App

echo "Installing dependencies..."
npm install

echo "Building production bundle..."
npm run build

echo "Starting preview server..."
npm run preview -- --host 0.0.0.0 --port ${PORT:-8080}
