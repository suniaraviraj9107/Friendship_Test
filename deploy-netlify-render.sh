#!/bin/bash
# Netlify + Render Deployment Script for Linux/Mac

echo "🚀 Starting Netlify + Render Deployment Process..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo ""
echo "🎯 Deployment Options:"
echo "1. Deploy Frontend to Netlify"
echo "2. Deploy Backend to Render"
echo "3. Deploy Both (Recommended)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🌐 Deploying Frontend to Netlify..."
        cd frontend
        netlify deploy --prod --dir .
        cd ..
        ;;
    2)
        echo "⚡ Deploying Backend to Render..."
        echo "Please push your code to GitHub and deploy manually on Render dashboard:"
        echo "https://dashboard.render.com"
        ;;
    3)
        echo "🚀 Deploying Both Frontend and Backend..."
        
        # Deploy frontend to Netlify
        echo "🌐 Step 1: Deploying Frontend to Netlify..."
        cd frontend
        netlify deploy --prod --dir .
        cd ..
        
        echo "⚡ Step 2: Deploy Backend to Render manually:"
        echo "1. Push code to GitHub"
        echo "2. Connect GitHub repo to Render"
        echo "3. Set environment variables in Render dashboard"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "📋 Your Application URLs:"
echo "🌐 Frontend (Netlify): https://friendship-quiz-app.netlify.app"
echo "⚡ Backend (Render): https://friendship-quiz-backend.onrender.com"
echo ""
echo "🔧 Next Steps:"
echo "1. Update Netlify site name if needed"
echo "2. Configure MongoDB Atlas database"
echo "3. Set environment variables in Render dashboard"
echo "4. Test the live application"
