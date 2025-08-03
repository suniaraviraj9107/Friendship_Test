# 🔥 Firebase Deployment Guide

## Prerequisites

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

## Quick Deployment

### Option 1: Automated Script (Recommended)

**Windows PowerShell:**
```powershell
.\deploy-firebase.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-firebase.sh
./deploy-firebase.sh
```

### Option 2: Manual Deployment

1. **Install all dependencies:**
   ```bash
   npm run firebase:setup
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

## Your Live Application

After successful deployment:

- **🌐 Frontend**: https://friendship-e96b6.firebaseapp.com
- **⚡ API**: https://us-central1-friendship-e96b6.cloudfunctions.net/api
- **📊 Health Check**: https://us-central1-friendship-e96b6.cloudfunctions.net/api/health

## Firebase Configuration

Your project is configured with:

- **Project ID**: friendship-e96b6
- **Hosting**: Frontend files served from `frontend/` directory
- **Functions**: Backend API served from `functions/` directory  
- **Database**: Firestore NoSQL database
- **API Routing**: `/api/**` routes to Firebase Functions

## Key Features Deployed

✅ **Complete Friendship Quiz Application**
✅ **User Authentication** (Register/Login)
✅ **AI Question Generation** (Multiple questions per topic)
✅ **Quiz Creation & Taking**
✅ **Dashboard with Analytics**
✅ **Certificate Generation** (5 beautiful styles)
✅ **Social Media Sharing**
✅ **Mobile Responsive Design**
✅ **Tibker Tutor Attribution**

## Environment Variables

For production deployment, make sure to set:

```bash
# Set JWT secret for Firebase Functions
firebase functions:config:set jwt.secret="your-super-secret-jwt-key"
```

## Troubleshooting

1. **Functions not deploying?**
   ```bash
   cd functions && npm install
   firebase deploy --only functions
   ```

2. **Hosting not updating?**
   ```bash
   firebase deploy --only hosting
   ```

3. **Database permissions?**
   - Check `firestore.rules` file
   - Ensure proper authentication

## Support

- Firebase Console: https://console.firebase.google.com/project/friendship-e96b6
- Functions Logs: `firebase functions:log`
- Local Testing: `firebase serve`
