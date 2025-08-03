#!/bin/bash

# Friendship Quiz App - Development Startup Script
echo "🎉 Starting Friendship Quiz App Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "🔧 Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your MongoDB URI and JWT secret"
fi

echo ""
echo "🚀 Starting development servers..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both frontend and backend
npm run dev
