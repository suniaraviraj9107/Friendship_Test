# 🚀 Netlify + Render Deployment Guide

## Overview

This guide will help you deploy your Friendship Quiz application with:
- **Frontend** → Netlify (Static hosting)
- **Backend** → Render (Node.js hosting)
- **Database** → MongoDB Atlas (Cloud database)

## Prerequisites

1. **GitHub Account** - To store your code
2. **Netlify Account** - For frontend hosting
3. **Render Account** - For backend hosting  
4. **MongoDB Atlas Account** - For database hosting

## 🌐 Frontend Deployment (Netlify)

### Option 1: Automated Deployment

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy Frontend:**
   ```bash
   # Windows
   .\deploy-netlify-render.ps1
   
   # Linux/Mac
   chmod +x deploy-netlify-render.sh
   ./deploy-netlify-render.sh
   ```

### Option 2: Manual Deployment

1. **Login to Netlify:**
   ```bash
   netlify login
   ```

2. **Deploy from frontend folder:**
   ```bash
   cd frontend
   netlify deploy --prod --dir .
   ```

### Option 3: Git-based Deployment (Recommended)

1. Push code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Set build settings:
   - **Build command:** `echo "No build required"`
   - **Publish directory:** `frontend`
6. Deploy!

## ⚡ Backend Deployment (Render)

### Step 1: Prepare Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier available)
3. Create database user and get connection string
4. Whitelist all IP addresses (0.0.0.0/0) for Render

### Step 2: Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure deployment:
   - **Name:** `friendship-quiz-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend`

### Step 3: Set Environment Variables

In Render dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/friendshipquiz
FRONTEND_URL=https://your-netlify-app.netlify.app
```

## 🔗 Update API Endpoints

After deployment, update the API URL in `frontend/script.js`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://your-render-app.onrender.com/api';
```

## 📋 Post-Deployment Checklist

### ✅ Test Your Application

1. **Frontend URL:** `https://your-app.netlify.app`
2. **Backend Health:** `https://your-backend.onrender.com/api/health`
3. **Full functionality:**
   - User registration/login
   - Quiz creation with AI
   - Quiz taking and results
   - Certificate generation
   - Social sharing

### ✅ Domain Configuration (Optional)

1. **Custom Domain for Netlify:**
   - Go to Site settings → Domain management
   - Add custom domain

2. **Custom Domain for Render:**
   - Go to Settings → Custom Domains
   - Add your domain

## 🛠️ Environment Variables Reference

### Render (Backend)
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=generate-a-secure-key
MONGODB_URI=your-mongodb-atlas-connection-string
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### Netlify (Frontend)
No environment variables needed for basic deployment.

## 🔄 Continuous Deployment

### Auto-deploy on Git Push

1. **Netlify:** Automatically deploys when you push to main branch
2. **Render:** Automatically deploys when you push to main branch

Both platforms will automatically redeploy when you push updates to GitHub!

## 📊 Monitoring & Logs

### Netlify
- **Dashboard:** https://app.netlify.com
- **Deploy logs:** Available in dashboard
- **Function logs:** Real-time in dashboard

### Render  
- **Dashboard:** https://dashboard.render.com
- **Logs:** Real-time logs in dashboard
- **Metrics:** CPU, memory usage available

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check FRONTEND_URL in Render environment variables
   - Ensure Netlify URL is added to CORS origins

2. **Database Connection:**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist (0.0.0.0/0 for Render)

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json

### Debug Commands

```bash
# Check Netlify deployment
netlify status

# Check Render logs
# (Available in Render dashboard)

# Test API endpoints
curl https://your-backend.onrender.com/api/health
```

## 💰 Cost Breakdown

- **Netlify:** Free tier (100GB bandwidth/month)
- **Render:** Free tier (750 hours/month)
- **MongoDB Atlas:** Free tier (512MB storage)

**Total: FREE for small to medium usage!**

## 🎯 Production URLs

After deployment, your application will be available at:

- **Frontend:** `https://friendship-quiz-app.netlify.app`
- **Backend API:** `https://friendship-quiz-backend.onrender.com`
- **Health Check:** `https://friendship-quiz-backend.onrender.com/api/health`

## 🚀 Quick Deploy Commands

```bash
# Install CLIs
npm install -g netlify-cli

# Deploy frontend
cd frontend && netlify deploy --prod

# Deploy backend (via GitHub + Render dashboard)
git add . && git commit -m "Deploy to production"
git push origin main
```

Your **Friendship Quiz Application** is now ready for production deployment! 🌟
