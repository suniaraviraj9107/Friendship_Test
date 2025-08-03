#!/bin/bash

# Friendship Quiz App Setup Script
# This script sets up the complete application for development or production

echo "🎉 Setting up Friendship Quiz App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "🔧 Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual configuration values"
fi

# Check if MongoDB is running (optional check)
echo "🗄️  Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB CLI tools found"
elif command -v mongo &> /dev/null; then
    echo "✅ MongoDB CLI tools found"
else
    echo "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your MongoDB URI and JWT secret"
echo "2. Start MongoDB if using local installation"
echo "3. Run 'npm run dev' to start development servers"
echo "4. Access the app at http://localhost:3000"
echo ""
echo "🚀 For production deployment, see DEPLOYMENT.md"
echo ""
echo "Happy coding! 💻✨"
