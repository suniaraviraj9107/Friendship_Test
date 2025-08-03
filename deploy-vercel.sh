#!/bin/bash
# Vercel Deployment Script for Friendship Quiz App
# This script automates the deployment process to Vercel

echo "🚀 Starting Vercel Deployment for Friendship Quiz App..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if [ $? -eq 0 ]; then
        print_success "Vercel CLI installed successfully"
    else
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
else
    print_success "Vercel CLI is already installed"
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    print_warning "Not logged in to Vercel. Please login..."
    vercel login
    if [ $? -ne 0 ]; then
        print_error "Failed to login to Vercel"
        exit 1
    fi
    print_success "Logged in to Vercel successfully"
else
    print_success "Already logged in to Vercel"
fi

# Install dependencies
print_status "Installing dependencies..."
npm run install:all
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Commit changes to git
print_status "Preparing code for deployment..."
git add .
git commit -m "Deploy to Vercel: $(date '+%Y-%m-%d %H:%M:%S')" || print_warning "No changes to commit"

# Deploy to Vercel
print_status "Deploying to Vercel..."
echo ""
echo "🌟 This will deploy your app to Vercel..."
echo "📝 Make sure you have set up these environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - NODE_ENV=production"
echo ""
read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Production deployment
    print_status "Starting production deployment..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_success "🎉 Deployment successful!"
        echo ""
        echo "✅ Your app is now live!"
        echo "🌐 Frontend: Check the URL provided by Vercel"
        echo "🔗 API: https://your-app.vercel.app/api"
        echo "🏥 Health Check: https://your-app.vercel.app/api/health"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Test your app functionality"
        echo "2. Set up environment variables if not done"
        echo "3. Configure MongoDB Atlas whitelist"
        echo "4. Share your app with friends!"
        echo ""
        
        # Test the deployment
        print_status "Testing deployment..."
        echo "Testing health endpoint..."
        
        # Get the deployment URL
        DEPLOYMENT_URL=$(vercel --prod 2>&1 | grep -o 'https://[^[:space:]]*' | tail -1)
        if [ ! -z "$DEPLOYMENT_URL" ]; then
            echo "🔗 Deployment URL: $DEPLOYMENT_URL"
            
            # Test health endpoint
            sleep 5  # Wait for deployment to be ready
            curl -s "$DEPLOYMENT_URL/api/health" > /dev/null
            if [ $? -eq 0 ]; then
                print_success "Health check passed!"
            else
                print_warning "Health check failed. Please check environment variables."
            fi
        fi
        
    else
        print_error "Deployment failed"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "1. Check if vercel.json is properly configured"
        echo "2. Verify environment variables are set"
        echo "3. Check Vercel function logs"
        echo "4. Ensure MongoDB Atlas is configured correctly"
        exit 1
    fi
else
    print_warning "Deployment cancelled by user"
    exit 0
fi

print_success "🎉 Deployment script completed!"
echo ""
echo "📚 For more information, see VERCEL_DEPLOYMENT.md"
