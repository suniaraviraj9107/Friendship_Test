const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for Firebase Functions
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
app.get('/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Friendship Quiz Backend is running on Firebase!',
    timestamp: new Date().toISOString()
  });
});

// JWT Secret (in production, use Firebase Functions config)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Helper function to generate quiz code
function generateQuizCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = { id: decoded.userId, ...userDoc.data() };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Auth Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUsers = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    if (!existingUsers.empty) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userRef = db.collection('users').doc();
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: userRef.id, email: userData.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = userData;
    userResponse.id = userRef.id;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    
    if (usersSnapshot.empty) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = user;
    userResponse.id = userDoc.id;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Quiz Routes
app.post('/quizzes', authenticateToken, async (req, res) => {
  try {
    const { title, creatorName, questions } = req.body;

    // Validation
    if (!title || !creatorName || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title, creator name, and at least one question are required' });
    }

    if (questions.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 questions allowed' });
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question || !question.options || question.options.length !== 4 || 
          question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer > 3) {
        return res.status(400).json({ message: 'Each question must have a question text, 4 options, and a valid correct answer (0-3)' });
      }
    }

    // Generate unique quiz code
    let code;
    let codeExists = true;
    while (codeExists) {
      code = generateQuizCode();
      const existingQuiz = await db.collection('quizzes').where('code', '==', code).get();
      codeExists = !existingQuiz.empty;
    }

    // Create quiz
    const quizRef = db.collection('quizzes').doc();
    const quizData = {
      title: title.trim(),
      creator: creatorName.trim(),
      creatorId: req.user.id,
      code,
      questions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await quizRef.set(quizData);

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        id: quizRef.id,
        ...quizData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/quizzes', authenticateToken, async (req, res) => {
  try {
    const quizzesSnapshot = await db.collection('quizzes')
      .where('creatorId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    const quizzes = [];
    
    for (const doc of quizzesSnapshot.docs) {
      const quizData = doc.data();
      
      // Get responses for this quiz
      const responsesSnapshot = await db.collection('quizzes').doc(doc.id)
        .collection('responses').get();
      
      const responses = responsesSnapshot.docs.map(responseDoc => ({
        id: responseDoc.id,
        ...responseDoc.data()
      }));

      quizzes.push({
        _id: doc.id,
        id: doc.id,
        ...quizData,
        responses
      });
    }

    res.json(quizzes);

  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/quizzes/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const quizzesSnapshot = await db.collection('quizzes')
      .where('code', '==', code.toUpperCase())
      .get();

    if (quizzesSnapshot.empty) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quizDoc = quizzesSnapshot.docs[0];
    const quiz = {
      id: quizDoc.id,
      ...quizDoc.data()
    };

    res.json(quiz);

  } catch (error) {
    console.error('Get quiz by code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/quizzes/:quizId/responses', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { respondentName, answers } = req.body;

    if (!respondentName || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Respondent name and answers are required' });
    }

    // Get quiz
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    if (!quizDoc.exists) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = quizDoc.data();

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Number of answers must match number of questions' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    // Save response
    const responseRef = db.collection('quizzes').doc(quizId).collection('responses').doc();
    const responseData = {
      respondentName: respondentName.trim(),
      answers,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await responseRef.set(responseData);

    res.json({
      message: 'Response submitted successfully',
      result: {
        id: responseRef.id,
        ...responseData,
        submittedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/quizzes/:quizId/responses/:responseId', authenticateToken, async (req, res) => {
  try {
    const { quizId, responseId } = req.params;

    // Check if user owns the quiz
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    if (!quizDoc.exists) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = quizDoc.data();
    if (quiz.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get response
    const responseDoc = await db.collection('quizzes').doc(quizId)
      .collection('responses').doc(responseId).get();
    
    if (!responseDoc.exists) {
      return res.status(404).json({ message: 'Response not found' });
    }

    const response = responseDoc.data();

    // Build detailed analysis
    const questions = quiz.questions.map((question, index) => ({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer: response.answers[index],
      isCorrect: response.answers[index] === question.correctAnswer
    }));

    res.json({
      respondent: response.respondentName,
      score: response.score,
      percentage: response.percentage,
      submittedAt: response.submittedAt,
      questions
    });

  } catch (error) {
    console.error('Get detailed response error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/quizzes/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;

    // Check if user owns the quiz
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    if (!quizDoc.exists) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = quizDoc.data();
    if (quiz.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all responses first
    const responsesSnapshot = await db.collection('quizzes').doc(quizId)
      .collection('responses').get();
    
    const batch = db.batch();
    responsesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the quiz
    batch.delete(db.collection('quizzes').doc(quizId));
    
    await batch.commit();

    res.json({ message: 'Quiz deleted successfully' });

  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
