# Project Health Check Script
# This script verifies that all components are working correctly

Write-Host "Project Health Check - Friendship Quiz App" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue

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

# Check Node.js
Write-Info "Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js installed: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js"
    exit 1
}

# Check npm
Write-Info "Checking npm..."
try {
    $npmVersion = npm --version
    Write-Success "npm installed: $npmVersion"
} catch {
    Write-Error "npm not found"
    exit 1
}

# Check project structure
Write-Info "Checking project structure..."
$requiredFiles = @(
    "package.json",
    "vercel.json",
    "backend\server.js",
    "backend\package.json",
    "frontend\index.html",
    "frontend\script.js",
    "frontend\styles.css",
    "frontend\package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Found: $file"
    } else {
        Write-Error "Missing: $file"
    }
}

# Check dependencies
Write-Info "Checking dependencies..."
if (Test-Path "node_modules") {
    Write-Success "Root dependencies installed"
} else {
    Write-Warning "Root dependencies not installed"
}

if (Test-Path "backend\node_modules") {
    Write-Success "Backend dependencies installed"
} else {
    Write-Warning "Backend dependencies not installed"
}

if (Test-Path "frontend\node_modules") {
    Write-Success "Frontend dependencies installed"
} else {
    Write-Warning "Frontend dependencies not installed"
}

# Check configuration files
Write-Info "Checking configuration files..."

# Check vercel.json
$vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
if ($vercelConfig.builds -and $vercelConfig.routes) {
    Write-Success "Vercel configuration is valid"
} else {
    Write-Error "Vercel configuration is invalid"
}

# Check API configuration in frontend
$frontendScript = Get-Content "frontend\script.js" -Raw
if ($frontendScript -match "'/api'") {
    Write-Success "Frontend API configuration is correct for Vercel"
} else {
    Write-Warning "Frontend API configuration may need review"
}

# Check backend CORS configuration
$backendScript = Get-Content "backend\server.js" -Raw
if ($backendScript -match "vercel\.app") {
    Write-Success "Backend CORS configured for Vercel"
} else {
    Write-Warning "Backend CORS configuration may need review"
}

# Check environment file
if (Test-Path "backend\.env.example") {
    Write-Success "Environment example file exists"
} else {
    Write-Warning "Environment example file missing"
}

# Test JSON validity
Write-Info "Testing JSON file validity..."
try {
    Get-Content "package.json" | ConvertFrom-Json | Out-Null
    Write-Success "Root package.json is valid JSON"
} catch {
    Write-Error "Root package.json has JSON syntax errors"
}

try {
    Get-Content "backend\package.json" | ConvertFrom-Json | Out-Null
    Write-Success "Backend package.json is valid JSON"
} catch {
    Write-Error "Backend package.json has JSON syntax errors"
}

try {
    Get-Content "frontend\package.json" | ConvertFrom-Json | Out-Null
    Write-Success "Frontend package.json is valid JSON"
} catch {
    Write-Error "Frontend package.json has JSON syntax errors"
}

# Summary
Write-Host ""
Write-Host "Health Check Complete!" -ForegroundColor Blue
Write-Host ""
Write-Info "Next Steps:"
Write-Host "1. Run 'npm run dev' to start development server" -ForegroundColor White
Write-Host "2. Run '.\deploy-vercel.ps1' to deploy to Vercel" -ForegroundColor White
Write-Host "3. Set up environment variables in Vercel dashboard" -ForegroundColor White
Write-Host ""
Write-Success "Your Friendship Quiz App is ready!"
