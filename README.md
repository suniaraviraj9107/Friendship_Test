# 🎉 Friendship Quiz App

A comprehensive friendship quiz web application built for Friendship Day celebrations! Create personalized quizzes, test how well your friends know you, and share beautiful certificates on social media.

![Friendship Quiz App](https://img.shields.io/badge/Friendship-Quiz-pink) 
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Live Demo
- **Live App**: [friendship-quiz-app.vercel.app](https://friendship-quiz-app.vercel.app)
- **GitHub Repository**: [github.com/suniaraviraj9107/Friendship](https://github.com/suniaraviraj9107/Friendship)

## ✨ Features

### 🎯 Core Functionality
- **Quiz Creation**: Create personalized friendship quizzes with up to 10 questions
- **Smart Sharing**: Generate unique quiz codes to share with friends
- **Instant Results**: Get friendship percentage scores with detailed analysis
- **Certificate Generator**: Create beautiful friendship certificates for social media
- **Social Media Integration**: Share results on WhatsApp, LinkedIn, and Instagram

### 🚀 Advanced Features
- **User Authentication**: Secure JWT-based login/registration system
- **AI Question Generator**: Generate questions automatically with AI assistance
- **Detailed Analytics**: View who took your quiz and their individual responses
- **Responsive Design**: Fully mobile-friendly and touch-optimized
- **Real-time Dashboard**: Track quiz performance and statistics

## 📁 Project Structure

```
friendship-quiz-app/
├── 📊 backend/                # Backend API Server
│   ├── 🚀 server.js           # Express server setup
│   ├── 📦 package.json        # Backend dependencies
│   └── 🔧 .env.example        # Environment configuration
├── 🎨 frontend/               # Frontend Application
│   ├── 📄 index.html          # Main application HTML
│   ├── 🎨 styles.css          # Responsive CSS styles
│   ├── ⚡ script.js           # Frontend JavaScript logic
│   ├── 📦 package.json        # Frontend dependencies
│   └── 🧪 certificate-test.html # Certificate testing page
├── ⚙️ vercel.json             # Deployment configuration
├── 📋 package.json            # Root project configuration
├── 🚀 start-dev.sh           # Linux/Mac startup script
├── 🚀 start-dev.ps1          # Windows PowerShell startup script
├── 📖 README.md              # This documentation
└── 🚀 DEPLOYMENT.md          # Deployment guide
```

## 🚀 **Deployment Instructions**

### **Firebase Deployment (Recommended)**

This project is configured for Firebase Hosting and Firebase Functions deployment.

#### **Prerequisites:**
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

#### **Quick Deploy:**
```powershell
# Windows PowerShell
.\deploy-firebase.ps1

# Or Linux/Mac
chmod +x deploy-firebase.sh
./deploy-firebase.sh
```

#### **Manual Deployment Steps:**

1. **Install all dependencies:**
   ```bash
   npm run firebase:setup
   ```

2. **Deploy to Firebase:**
   ```bash
   # Deploy everything
   firebase deploy
   
   # Or deploy individually
   firebase deploy --only hosting    # Frontend only
   firebase deploy --only functions  # Backend only
   ```

3. **Your app will be live at:**
   - **Frontend**: https://friendship-e96b6.firebaseapp.com
   - **API**: https://us-central1-friendship-e96b6.cloudfunctions.net/api

### **Local Development**

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Option 1: One-Command Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/friendship-quiz-app.git
cd friendship-quiz-app
```

2. **Install all dependencies:**
```bash
npm run install:all
```

3. **Setup environment:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

4. **Start development servers:**
```bash
npm run dev
```

## 🌐 Access Your Application

After running the development command:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Certificate Test**: http://localhost:3000/certificate-test.html

## 🛠 Development Commands

### Root Project Commands
```bash
# Start both frontend and backend
npm run dev

# Install all dependencies
npm run install:all

# Setup project with environment files
npm run setup
```

### Backend Commands
```bash
# Start backend only
npm run dev:backend

# Start backend in production
npm run start:backend

# Install backend dependencies
npm run install:backend
```

### Frontend Commands
```bash
# Start frontend only
npm run dev:frontend

# Start frontend in production
npm run start:frontend

# Install frontend dependencies
npm run install:frontend
```

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Database Connection
MONGODB_URI=mongodb://localhost:27017/friendship-quiz
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/friendship-quiz

# JWT Secret (Generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses your deployed backend URL

To manually configure, edit `frontend/script.js`:
```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## 💻 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quiz Management
- `GET /api/quizzes` - Get user's quizzes
- `POST /api/quizzes` - Create new quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `GET /api/quizzes/code/:code` - Get quiz by code

### Quiz Responses
- `POST /api/quizzes/:id/responses` - Submit quiz response
- `GET /api/quizzes/:id/responses/:responseId` - Get detailed results

## 🎨 Certificate Features

### 5 Beautiful Styles
- **Elegant Gold**: Classic golden gradient design
- **Modern Gradient**: Contemporary purple-blue gradient
- **Classic Blue**: Professional blue theme
- **Friendship Pink**: Warm pink celebration theme
- **Celebration Purple**: Festive purple design

### Sharing Options
- **Direct Download**: High-quality PNG certificates
- **WhatsApp**: Auto-download + pre-written message
- **LinkedIn**: Auto-download + professional post template
- **Instagram**: Auto-download + story caption copy

## 📱 Mobile Features

- **Touch-optimized interface**
- **Responsive breakpoints** (768px, 576px)
- **Mobile-first CSS Grid**
- **Touch feedback animations**
- **iOS Safari optimizations**

## 🚀 Production Deployment

### Option 1: Vercel (Recommended)

1. **Deploy Backend:**
   - Push backend to separate repository
   - Deploy to Vercel/Railway/Heroku
   - Set environment variables

2. **Deploy Frontend:**
   - Update API_BASE_URL in script.js
   - Deploy frontend to Vercel/Netlify

### Option 2: Traditional Hosting

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Controlled cross-origin access
- **Security Headers**: Helmet.js protection

## 🧪 Testing

Test the certificate functionality:
```bash
# Open certificate test page
http://localhost:3000/certificate-test.html
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Font Awesome for beautiful icons
- Google Fonts for typography
- MongoDB Atlas for database hosting
- Vercel for easy deployment

---

**Made with ❤️ for Friendship Day! 🎉**

Celebrate friendship and create memorable quiz experiences with your friends!
