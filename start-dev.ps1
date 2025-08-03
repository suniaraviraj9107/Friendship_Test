# Friendship Quiz App - Development Startup Script for Windows
Write-Host "🎉 Starting Friendship Quiz App Development Environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v14 or higher." -ForegroundColor Red
    exit 1
}

# Install dependencies if not already installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Blue
    npm install
}

if (!(Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
    Set-Location backend
    npm install
    Set-Location ..
}

if (!(Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
    Set-Location frontend
    npm install
    Set-Location ..
}

# Create .env file if it doesn't exist
if (!(Test-Path "backend\.env")) {
    Write-Host "🔧 Creating environment configuration..." -ForegroundColor Blue
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Please edit backend\.env with your MongoDB URI and JWT secret" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting development servers..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both frontend and backend
npm run dev
