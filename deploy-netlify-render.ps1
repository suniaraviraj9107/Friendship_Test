# Netlify + Render Deployment Script for Windows PowerShell

Write-Host "🚀 Starting Netlify + Render Deployment Process..." -ForegroundColor Green

# Check if Netlify CLI is installed
if (!(Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Check if Render CLI is installed
if (!(Get-Command render -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Render CLI..." -ForegroundColor Yellow
    npm install -g @render/cli
}

Write-Host ""
Write-Host "🎯 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Deploy Frontend to Netlify" -ForegroundColor White
Write-Host "2. Deploy Backend to Render" -ForegroundColor White
Write-Host "3. Deploy Both (Recommended)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "🌐 Deploying Frontend to Netlify..." -ForegroundColor Green
        cd frontend
        netlify deploy --prod --dir .
        cd ..
    }
    "2" {
        Write-Host "⚡ Deploying Backend to Render..." -ForegroundColor Green
        Write-Host "Please push your code to GitHub and deploy manually on Render dashboard:" -ForegroundColor Yellow
        Write-Host "https://dashboard.render.com" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "🚀 Deploying Both Frontend and Backend..." -ForegroundColor Green
        
        # Deploy frontend to Netlify
        Write-Host "🌐 Step 1: Deploying Frontend to Netlify..." -ForegroundColor Yellow
        cd frontend
        netlify deploy --prod --dir .
        cd ..
        
        Write-Host "⚡ Step 2: Deploy Backend to Render manually:" -ForegroundColor Yellow
        Write-Host "1. Push code to GitHub" -ForegroundColor White
        Write-Host "2. Connect GitHub repo to Render" -ForegroundColor White
        Write-Host "3. Set environment variables in Render dashboard" -ForegroundColor White
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "✅ Deployment process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your Application URLs:" -ForegroundColor Cyan
Write-Host "🌐 Frontend (Netlify): https://friendship-quiz-app.netlify.app" -ForegroundColor White
Write-Host "⚡ Backend (Render): https://friendship-quiz-backend.onrender.com" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update Netlify site name if needed" -ForegroundColor White
Write-Host "2. Configure MongoDB Atlas database" -ForegroundColor White
Write-Host "3. Set environment variables in Render dashboard" -ForegroundColor White
Write-Host "4. Test the live application" -ForegroundColor White
