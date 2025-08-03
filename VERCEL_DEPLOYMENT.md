# 🚀 Vercel Deployment Guide - Friendship Quiz App

Complete guide to deploy your Friendship Quiz App on Vercel with both frontend and backend on the same platform.

## 📋 Prerequisites

1. **GitHub Account**: Your code repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas**: Cloud database (free tier available)
4. **Environment Variables**: Database connection strings

## 🎯 Project Configuration

### ✅ **Vercel Configuration** (`vercel.json`)
Already configured for full-stack deployment:
```json
{
  "version": 2,
  "name": "friendship-quiz-app",
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### ✅ **API Configuration**
Frontend automatically detects Vercel deployment:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'  // Local development
  : '/api';  // Vercel deployment - same domain
```

### ✅ **CORS Configuration**
Backend configured for Vercel domains:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    /\.vercel\.app$/  // Any Vercel domain
  ].filter(Boolean),
  credentials: true
}));
```

## 🚀 Deployment Steps

### **Step 1: Push to GitHub**

1. **Initialize Git Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Friendship Quiz App"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com)
   - Create new repository: `friendship-quiz-app`
   - Copy the repository URL

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/suniaraviraj9107/Friendship.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Setup MongoDB Atlas**

1. **Create MongoDB Account**:
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account

2. **Create Cluster**:
   - Create new cluster (free tier: M0)
   - Choose cloud provider and region
   - Create cluster (takes 3-5 minutes)

3. **Setup Database User**:
   - Go to Database Access
   - Add new database user
   - Choose username/password authentication
   - Give user "Read and write to any database" permission

4. **Setup Network Access**:
   - Go to Network Access
   - Add IP Address
   - Choose "Allow access from anywhere" (0.0.0.0/0)

5. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### **Step 3: Deploy to Vercel**

1. **Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub account

2. **Import Project**:
   - Click "New Project"
   - Import from GitHub
   - Select your `friendship-quiz-app` repository
   - Click "Import"

3. **Configure Environment Variables**:
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/friendshipquiz?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)
   - Your app will be live at: `https://your-app-name.vercel.app`

## 🔧 Environment Variables Setup

### **Required Variables**:
```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/friendshipquiz

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Environment
NODE_ENV=production

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **How to Generate JWT Secret**:
```bash
# Method 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Online
# Use: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

## 🧪 Testing Your Deployment

### **1. Health Check**:
Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-08-03T...",
  "uptime": 123.456
}
```

### **2. Frontend Test**:
- Visit: `https://your-app.vercel.app`
- Check if the app loads properly
- Test registration/login functionality

### **3. Database Test**:
- Register a new user
- Create a quiz
- Take the quiz
- Check dashboard

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
# Vercel will automatically deploy the changes
```

## 📊 Monitoring & Analytics

1. **Vercel Dashboard**:
   - View deployment logs
   - Monitor function execution
   - Check performance metrics

2. **Function Logs**:
   - Go to Vercel Dashboard → Functions
   - Click on your function to view logs
   - Monitor API requests and errors

## 🛠️ Local Development

Continue developing locally with:

```bash
# Install dependencies
npm run install:all

# Start development
npm run dev

# Or manually:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 🔧 Troubleshooting

### **Common Issues**:

1. **Build Fails**:
   - Check if all dependencies are listed in package.json
   - Verify vercel.json syntax

2. **Database Connection Error**:
   - Verify MongoDB URI in environment variables
   - Check if IP is whitelisted in MongoDB Atlas

3. **API Routes Not Working**:
   - Ensure vercel.json routing is correct
   - Check if API_BASE_URL is properly configured

4. **CORS Errors**:
   - Verify CORS configuration in backend/server.js
   - Check if domain is properly whitelisted

### **Debug Commands**:
```bash
# Check Vercel deployment
vercel --debug

# View function logs
vercel logs

# Test API locally
curl https://your-app.vercel.app/api/health
```

## 📈 Performance Optimization

1. **Function Timeout**:
   - Default: 10 seconds
   - Can increase in vercel.json

2. **Cold Starts**:
   - Vercel functions may have cold start delays
   - Consider upgrading to Pro plan for better performance

3. **Database Optimization**:
   - Use MongoDB indexes for better query performance
   - Implement database connection pooling

## 🎉 Success!

Your Friendship Quiz App is now live on Vercel! 

**Your URLs**:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **Health Check**: `https://your-app.vercel.app/api/health`

Share your app with friends and start creating amazing friendship quizzes! 🚀

---

## 📞 Support

If you encounter any issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Review API endpoints

For more help, check the [Vercel documentation](https://vercel.com/docs) or [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/).
