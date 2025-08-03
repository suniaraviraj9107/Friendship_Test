# Vercel Deployment Script for Friendship Quiz App (PowerShell)
# This script automates the deployment process to Vercel

Write-Host "🚀 Starting Vercel Deployment for Friendship Quiz App..." -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue

# Function to print colored output
function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Info "Initializing Git repository..."
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Git repository initialized"
    } else {
        Write-Error "Failed to initialize Git repository"
        exit 1
    }
} else {
    Write-Success "Git repository already exists"
}

# Check if Vercel CLI is installed
Write-Info "Checking Vercel CLI installation..."
try {
    $vercelVersion = vercel --version 2>$null
    Write-Success "Vercel CLI is installed: $vercelVersion"
} catch {
    Write-Warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Vercel CLI installed successfully"
    } else {
        Write-Error "Failed to install Vercel CLI"
        exit 1
    }
}

# Check if user is logged in to Vercel
Write-Info "Checking Vercel authentication..."
try {
    $whoami = vercel whoami 2>$null
    Write-Success "Already logged in to Vercel as: $whoami"
} catch {
    Write-Warning "Not logged in to Vercel. Please login..."
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to login to Vercel"
        exit 1
    }
    Write-Success "Logged in to Vercel successfully"
}

# Install dependencies
Write-Info "Installing dependencies..."
npm run install:all
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed successfully"
} else {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Commit changes to git
Write-Info "Preparing code for deployment..."
git add .
$commitMessage = "Deploy to Vercel: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Warning "No changes to commit or commit failed"
}

# Deploy to Vercel
Write-Info "Preparing for Vercel deployment..."
Write-Host ""
Write-Host "🌟 This will deploy your app to Vercel..." -ForegroundColor Yellow
Write-Host "📝 Make sure you have set up these environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   - MONGODB_URI" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Continue with deployment? (y/n)"

if ($choice -eq 'y' -or $choice -eq 'Y') {
    # Production deployment
    Write-Info "Starting production deployment..."
    Write-Host ""
    
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "🎉 Deployment successful!"
        Write-Host ""
        Write-Host "✅ Your app is now live!" -ForegroundColor Green
        Write-Host "🌐 Frontend: Check the URL provided by Vercel" -ForegroundColor Cyan
        Write-Host "🔗 API: https://your-app.vercel.app/api" -ForegroundColor Cyan
        Write-Host "🏥 Health Check: https://your-app.vercel.app/api/health" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Test your app functionality" -ForegroundColor White
        Write-Host "2. Set up environment variables if not done" -ForegroundColor White
        Write-Host "3. Configure MongoDB Atlas whitelist" -ForegroundColor White
        Write-Host "4. Share your app with friends!" -ForegroundColor White
        Write-Host ""
        
        # Test the deployment
        Write-Info "Testing deployment..."
        Write-Host "🔍 Please test the following:" -ForegroundColor Yellow
        Write-Host "- Visit your app URL" -ForegroundColor White
        Write-Host "- Try registering a new user" -ForegroundColor White
        Write-Host "- Create a quiz" -ForegroundColor White
        Write-Host "- Take the quiz" -ForegroundColor White
        Write-Host "- Check the dashboard" -ForegroundColor White
        
    } else {
        Write-Error "Deployment failed"
        Write-Host ""
        Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
        Write-Host "1. Check if vercel.json is properly configured" -ForegroundColor White
        Write-Host "2. Verify environment variables are set in Vercel dashboard" -ForegroundColor White
        Write-Host "3. Check Vercel function logs" -ForegroundColor White
        Write-Host "4. Ensure MongoDB Atlas is configured correctly" -ForegroundColor White
        Write-Host "5. Check that all dependencies are installed" -ForegroundColor White
        exit 1
    }
} else {
    Write-Warning "Deployment cancelled by user"
    exit 0
}

Write-Success "🎉 Deployment script completed!"
Write-Host ""
Write-Host "📚 For detailed instructions, see VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "🔗 GitHub Repository: https://github.com/suniaraviraj9107/Friendship" -ForegroundColor Cyan
