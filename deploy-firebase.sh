#!/bin/bash
# Firebase Deployment Script for Linux/Mac

echo "🚀 Starting Firebase Deployment Process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login

# Install all dependencies
echo "📦 Installing dependencies..."
npm run firebase:setup

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be live at: https://friendship-e96b6.firebaseapp.com"
echo "📊 Functions available at: https://us-central1-friendship-e96b6.cloudfunctions.net/api"
