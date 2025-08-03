# Friendship Quiz App Setup Script for Windows PowerShell
# This script sets up the complete application for development or production

Write-Host "🎉 Setting up Friendship Quiz App..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v14 or higher." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Create environment file if it doesn't exist
if (!(Test-Path "backend\.env")) {
    Write-Host "🔧 Creating environment configuration..." -ForegroundColor Blue
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Please edit backend\.env with your actual configuration values" -ForegroundColor Yellow
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

# Check if MongoDB is available
Write-Host "🗄️  Checking MongoDB..." -ForegroundColor Blue
try {
    $mongoVersion = mongosh --version
    Write-Host "✅ MongoDB CLI tools found: $mongoVersion" -ForegroundColor Green
} catch {
    try {
        $mongoVersion = mongo --version
        Write-Host "✅ MongoDB CLI tools found" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running." -ForegroundColor Yellow
        Write-Host "   You can use MongoDB Atlas (cloud) instead of local installation." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env with your MongoDB URI and JWT secret" -ForegroundColor White
Write-Host "2. Start MongoDB if using local installation" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start development servers" -ForegroundColor White
Write-Host "4. Access the app at http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🚀 For production deployment, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 💻✨" -ForegroundColor Magenta
