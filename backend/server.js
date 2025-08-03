const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:5500',
    'https://friendship-quiz-app.netlify.app',  // Your Netlify URL
    'https://main--friendship-quiz-app.netlify.app',  // Netlify preview URL
    /\.netlify\.app$/  // Any Netlify subdomain
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Friendship Quiz Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/friendshipquiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('📊 Database connected successfully');
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    }
  }],
  responses: [{
    id: {
      type: String,
      required: true
    },
    respondentName: {
      type: String,
      required: true
    },
    answers: [{
      type: Number,
      required: true
    }],
    score: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const User = mongoose.model('User', userSchema);
const Quiz = mongoose.model('Quiz', quizSchema);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate quiz code
const generateQuizCode = async () => {
  let code;
  let existingQuiz;
  
  do {
    code = Math.random().toString(36).substr(2, 8).toUpperCase();
    existingQuiz = await Quiz.findOne({ code });
  } while (existingQuiz);
  
  return code;
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create quiz
app.post('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    const { title, creatorName, questions } = req.body;

    if (!title || !creatorName || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Title, creator name, and questions are required' });
    }

    if (questions.length === 0 || questions.length > 10) {
      return res.status(400).json({ message: 'Quiz must have 1-10 questions' });
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question || !question.options || question.options.length !== 4 || 
          typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || question.correctAnswer > 3) {
        return res.status(400).json({ message: 'Invalid question format' });
      }
    }

    const code = await generateQuizCode();

    const quiz = new Quiz({
      code,
      title,
      creator: creatorName,
      creatorId: req.user.id,
      questions,
      responses: []
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        id: quiz._id,
        code: quiz.code,
        title: quiz.title,
        creator: quiz.creator,
        questionsCount: quiz.questions.length,
        createdAt: quiz.createdAt
      }
    });
  } catch (error) {
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Server error during quiz creation' });
  }
});

// Get user's quizzes
app.get('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      creatorId: req.user.id,
      isActive: true 
    }).select('-questions.correctAnswer');

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz by code (for taking quiz)
app.get('/api/quizzes/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const quiz = await Quiz.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    }).select('-questions.correctAnswer -responses');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
      id: quiz._id,
      code: quiz.code,
      title: quiz.title,
      creator: quiz.creator,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options
      }))
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz response
app.post('/api/quizzes/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const { respondentName, answers } = req.body;

    if (!respondentName || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Respondent name and answers are required' });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Invalid number of answers' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    const response = {
      id: Date.now().toString(),
      respondentName: respondentName.trim(),
      answers,
      score,
      percentage,
      completedAt: new Date(),
      ipAddress: req.ip
    };

    quiz.responses.push(response);
    await quiz.save();

    res.json({
      message: 'Response submitted successfully',
      result: {
        score,
        percentage,
        totalQuestions: quiz.questions.length,
        respondentName: response.respondentName
      }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed quiz results
app.get('/api/quizzes/:id/responses/:responseId', authenticateToken, async (req, res) => {
  try {
    const { id, responseId } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      creatorId: req.user.id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const response = quiz.responses.find(r => r.id === responseId);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    const detailedResult = {
      respondent: response.respondentName,
      score: response.score,
      percentage: response.percentage,
      completedAt: response.completedAt,
      questions: quiz.questions.map((question, index) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: response.answers[index],
        isCorrect: response.answers[index] === question.correctAnswer
      }))
    };

    res.json(detailedResult);
  } catch (error) {
    console.error('Get detailed results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete quiz
app.delete('/api/quizzes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, creatorId: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/friendshipquiz'}`);
});

module.exports = app;
