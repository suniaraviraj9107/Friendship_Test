# Firebase Deployment Script for Windows PowerShell
Write-Host "🚀 Starting Firebase Deployment Process..." -ForegroundColor Green

# Check if Firebase CLI is installed
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Login to Firebase (if not already logged in)
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Yellow
firebase login --no-localhost

# Install all dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm run firebase:setup

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Green
firebase deploy

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your app should be live at: https://friendship-e96b6.firebaseapp.com" -ForegroundColor Cyan
Write-Host "📊 Functions available at: https://us-central1-friendship-e96b6.cloudfunctions.net/api" -ForegroundColor Cyan
