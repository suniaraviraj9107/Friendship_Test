// API Configuration - Updated for Netlify + Render deployment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'  // Local development
  : 'https://friendship-quiz-backend.onrender.com/api';  // Render backend URL

// Global variables
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let authToken = localStorage.getItem('authToken') || null;
let currentRespondentName = null;

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
  if (currentUser && authToken) {
    loadDashboard();
  }
  
  // Add first question automatically when creating a quiz
  if (document.getElementById('questionsContainer')) {
    addQuestion();
  }
  
  // Add touch event support for mobile
  addTouchSupport();
});

// Add touch support for better mobile experience
function addTouchSupport() {
  // Add touch feedback for buttons
  document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('btn')) {
      e.target.style.transform = 'scale(0.95)';
    }
  });
  
  document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('btn')) {
      setTimeout(() => {
        e.target.style.transform = '';
      }, 150);
    }
  });
  
  // Prevent zoom on double tap for iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

// Navigation
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Load section-specific data
  if (sectionId === 'dashboard') {
    loadDashboard();
  }
  
  // Scroll to top on mobile
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Authentication Functions
function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userInfo = document.getElementById('userInfo');
  const welcomeUser = document.getElementById('welcomeUser');
  
  if (currentUser && authToken) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
  } else {
    loginBtn.style.display = 'inline-flex';
    registerBtn.style.display = 'inline-flex';
    userInfo.style.display = 'none';
  }
}

function checkLoginForCreate() {
  if (!currentUser || !authToken) {
    showLoginModal();
    return;
  }
  showSection('create');
}

function checkLoginForDashboard() {
  if (!currentUser || !authToken) {
    showLoginModal();
    return;
  }
  showSection('dashboard');
}

function showLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('loginForm').reset();
}

function showRegisterModal() {
  document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
  document.getElementById('registerModal').style.display = 'none';
  document.getElementById('registerForm').reset();
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    currentUser = response.user;
    authToken = response.token;
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('authToken', authToken);
    
    updateAuthUI();
    closeLoginModal();
    showNotification('Login successful!', 'success');
    showSection('create');
  } catch (error) {
    showNotification(error.message || 'Login failed. Please try again.', 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match!', 'error');
    return;
  }
  
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    
    currentUser = response.user;
    authToken = response.token;
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('authToken', authToken);
    
    updateAuthUI();
    closeRegisterModal();
    showNotification('Registration successful! You are now logged in.', 'success');
    showSection('create');
  } catch (error) {
    showNotification(error.message || 'Registration failed. Please try again.', 'error');
  }
}

function logout() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  updateAuthUI();
  showSection('home');
  showNotification('You have been logged out successfully.', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 3000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  // Set notification style based on type
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    info: '#3498db',
    warning: '#f39c12'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  
  // Show notification
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Hide notification after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
  }, 4000);
}

// Quiz Creation Functions
function addQuestion() {
  const container = document.getElementById('questionsContainer');
  const questionCount = container.querySelectorAll('.question-card').length;
  
  if (questionCount >= 10) {
    showNotification('Maximum 10 questions allowed', 'warning');
    return;
  }
  
  const questionId = Date.now();
  const questionCard = document.createElement('div');
  questionCard.className = 'question-card';
  questionCard.innerHTML = `
    <div class="question-header">
      <span class="question-number">Question ${questionCount + 1}</span>
      <button class="delete-question" onclick="deleteQuestion(this)">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
    
    <div class="form-group">
      <label>Question:</label>
      <input type="text" class="question-text" placeholder="e.g., What's my favorite color?" required>
    </div>
    
    <div class="form-group">
      <label>Answer Options:</label>
      <div class="options-grid">
        <div class="option-input">
          <input type="radio" name="correct_${questionId}" value="0" required>
          <input type="text" class="option-text" placeholder="Option A" required>
        </div>
        <div class="option-input">
          <input type="radio" name="correct_${questionId}" value="1" required>
          <input type="text" class="option-text" placeholder="Option B" required>
        </div>
        <div class="option-input">
          <input type="radio" name="correct_${questionId}" value="2" required>
          <input type="text" class="option-text" placeholder="Option C" required>
        </div>
        <div class="option-input">
          <input type="radio" name="correct_${questionId}" value="3" required>
          <input type="text" class="option-text" placeholder="Option D" required>
        </div>
      </div>
      <small style="color: #666; margin-top: 8px; display: block;">
        <i class="fas fa-info-circle"></i> Select the correct answer by clicking the radio button
      </small>
    </div>
  `;
  
  container.appendChild(questionCard);
  updateQuestionCounter();
  
  // Hide add button if max questions reached
  if (questionCount + 1 >= 10) {
    document.getElementById('addQuestionBtn').style.display = 'none';
  }
  
  // Scroll to new question on mobile
  if (window.innerWidth <= 768) {
    questionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function deleteQuestion(button) {
  button.closest('.question-card').remove();
  updateQuestionNumbers();
  updateQuestionCounter();
  
  // Show add button if under max questions
  const questionCount = document.querySelectorAll('.question-card').length;
  if (questionCount < 10) {
    document.getElementById('addQuestionBtn').style.display = 'inline-flex';
  }
}

function updateQuestionNumbers() {
  document.querySelectorAll('.question-card').forEach((card, index) => {
    card.querySelector('.question-number').textContent = `Question ${index + 1}`;
  });
}

function updateQuestionCounter() {
  const count = document.querySelectorAll('.question-card').length;
  document.querySelector('.question-counter').textContent = `(${count}/10 max)`;
}

async function saveQuiz() {
  if (!currentUser || !authToken) {
    showNotification('Please login to create a quiz', 'error');
    showLoginModal();
    return;
  }
  
  const creatorName = document.getElementById('creatorName').value.trim();
  const quizTitle = document.getElementById('quizTitle').value.trim();
  const questionCards = document.querySelectorAll('.question-card');
  
  if (!creatorName || !quizTitle) {
    showNotification('Please fill in your name and quiz title', 'error');
    return;
  }
  
  if (questionCards.length === 0) {
    showNotification('Please add at least one question', 'error');
    return;
  }
  
  const questions = [];
  let isValid = true;
  
  questionCards.forEach((card, index) => {
    const questionText = card.querySelector('.question-text').value.trim();
    const optionTexts = Array.from(card.querySelectorAll('.option-text')).map(input => input.value.trim());
    const correctAnswer = card.querySelector('input[type="radio"]:checked');
    
    if (!questionText || optionTexts.some(opt => !opt) || !correctAnswer) {
      showNotification(`Please complete Question ${index + 1}`, 'error');
      isValid = false;
      return;
    }
    
    questions.push({
      question: questionText,
      options: optionTexts,
      correctAnswer: parseInt(correctAnswer.value)
    });
  });
  
  if (!isValid) return;
  
  try {
    const response = await apiRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: quizTitle,
        creatorName: creatorName,
        questions: questions
      })
    });
    
    // Show quiz code modal
    showQuizCodeModal(response.quiz.code, response.quiz.title);
    
    // Reset form
    document.getElementById('creatorName').value = '';
    document.getElementById('quizTitle').value = '';
    document.getElementById('questionsContainer').innerHTML = '<h3>Questions <span class="question-counter">(0/10 max)</span></h3>';
    addQuestion();
    
    showNotification('Quiz created successfully!', 'success');
  } catch (error) {
    showNotification(error.message || 'Failed to create quiz. Please try again.', 'error');
  }
}

function generateQuizCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Quiz Taking Functions
function showTakeQuizModal() {
  document.getElementById('takeQuizModal').style.display = 'block';
}

function closeTakeQuizModal() {
  document.getElementById('takeQuizModal').style.display = 'none';
  document.getElementById('quizCode').value = '';
}

async function loadQuizByCode() {
  const code = document.getElementById('quizCode').value.trim().toUpperCase();
  
  if (!code) {
    showNotification('Please enter a quiz code', 'error');
    return;
  }
  
  try {
    const quiz = await apiRequest(`/quizzes/code/${code}`);
    
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    closeTakeQuizModal();
    showSection('takeQuiz');
    displayQuestion();
  } catch (error) {
    showNotification(error.message || 'Quiz not found. Please check the code and try again.', 'error');
  }
}

function displayQuestion() {
  const quizContent = document.getElementById('quizContent');
  const question = currentQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  
  quizContent.innerHTML = `
    <div class="quiz-header">
      <h2>${currentQuiz.title}</h2>
      <p>Created by ${currentQuiz.creator}</p>
    </div>
    
    <div class="quiz-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</div>
    </div>
    
    <div class="quiz-question">
      <h3 class="question-title">${question.question}</h3>
      
      <div class="quiz-options">
        ${question.options.map((option, index) => `
          <div class="quiz-option" onclick="selectOption(${index})" data-option="${index}">
            <input type="radio" name="answer" value="${index}">
            <span>${option}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center;">
        <button class="btn btn-primary" onclick="nextQuestion()" id="nextBtn" disabled>
          ${currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;
}

function selectOption(optionIndex) {
  // Remove previous selections
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('selected');
    opt.querySelector('input').checked = false;
  });
  
  // Select current option
  const selectedOption = document.querySelector(`[data-option="${optionIndex}"]`);
  selectedOption.classList.add('selected');
  selectedOption.querySelector('input').checked = true;
  
  // Enable next button
  document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  
  if (!selectedOption) {
    showNotification('Please select an answer', 'warning');
    return;
  }
  
  userAnswers.push(parseInt(selectedOption.value));
  
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    submitQuizResponse();
  }
}

async function submitQuizResponse() {
  document.getElementById('nameInputModal').style.display = 'block';
}

function closeNameInputModal() {
  document.getElementById('nameInputModal').style.display = 'none';
  document.getElementById('respondentNameInput').value = '';
}

async function submitWithName() {
  const respondentName = document.getElementById('respondentNameInput').value.trim();
  
  if (!respondentName) {
    showNotification('Please enter your name to submit the quiz', 'error');
    return;
  }
  
  currentRespondentName = respondentName;
  closeNameInputModal();
  
  try {
    const response = await apiRequest(`/quizzes/${currentQuiz.id}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        respondentName: currentRespondentName,
        answers: userAnswers
      })
    });
    
    showResults(response.result);
  } catch (error) {
    showNotification(error.message || 'Failed to submit quiz response. Please try again.', 'error');
  }
}

function showResults(result) {
  const friendshipLevel = getFriendshipLevel(result.percentage);
  const levelColor = getFriendshipColor(result.percentage);
  
  const resultsContent = `
    <div class="results-header">
      <h3>🎉 Quiz Complete! 🎉</h3>
      <div class="friendship-percentage" style="color: ${levelColor};">
        ${result.percentage}%
      </div>
      <div class="friendship-level" style="color: ${levelColor};">
        ${friendshipLevel}
      </div>
      <p>You got ${result.score} out of ${result.totalQuestions} questions correct!</p>
      
      <div class="social-share">
        <button class="btn btn-success" onclick="generateFriendshipCertificate(${result.percentage}, '${currentRespondentName || 'Friend'}', '${currentQuiz.creator}', '${currentQuiz.title}')" style="margin-bottom: 1rem; width: 100%;">
          <i class="fas fa-certificate"></i> Generate Friendship Certificate
        </button>
        
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
          <a href="#" class="share-btn share-whatsapp" onclick="shareOnWhatsApp(${result.percentage})">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
          <a href="#" class="share-btn share-linkedin" onclick="shareOnLinkedIn(${result.percentage})">
            <i class="fab fa-linkedin"></i> LinkedIn
          </a>
          <a href="#" class="share-btn share-instagram" onclick="shareOnInstagram(${result.percentage})">
            <i class="fab fa-instagram"></i> Instagram
          </a>
        </div>
      </div>
      
      <div style="margin-top: 2rem;">
        <button class="btn btn-primary" onclick="closeResultsModal(); showSection('home');">
          Take Another Quiz
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('resultsContent').innerHTML = resultsContent;
  document.getElementById('resultsModal').style.display = 'block';
}

function getFriendshipLevel(percentage) {
  if (percentage >= 90) return 'Best Friends Forever! 💕';
  if (percentage >= 75) return 'Great Friends! 👫';
  if (percentage >= 60) return 'Good Friends! 😊';
  if (percentage >= 40) return 'Getting to Know Each Other 🤝';
  return 'Time to Catch Up! 💬';
}

function getFriendshipColor(percentage) {
  if (percentage >= 90) return '#27ae60';
  if (percentage >= 75) return '#f39c12';
  if (percentage >= 60) return '#e67e22';
  if (percentage >= 40) return '#3498db';
  return '#e74c3c';
}

function closeResultsModal() {
  document.getElementById('resultsModal').style.display = 'none';
}

// Social Media Sharing Functions
function shareOnWhatsApp(percentage) {
  const text = `🎉 I just took a friendship quiz and scored ${percentage}%! Test how well you know me too! 💕`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareOnLinkedIn(percentage) {
  const text = `Just scored ${percentage}% on a friendship quiz! It's amazing to test how well our friends know us. Try creating your own friendship quiz!`;
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareOnInstagram(percentage) {
  const text = `🎉 Just scored ${percentage}% on a friendship quiz! How well do your friends know you? Test it out! 💕 #FriendshipDay #FriendshipQuiz #BestFriends`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Caption copied to clipboard! Paste it in your Instagram story or post.', 'success');
    });
  } else {
    prompt('Copy this caption for Instagram:', text);
  }
}

// Dashboard Functions
async function loadDashboard() {
  const dashboardContent = document.getElementById('dashboardContent');
  
  if (!currentUser || !authToken) {
    dashboardContent.innerHTML = `
      <div class="dashboard-empty">
        <i class="fas fa-lock"></i>
        <p>Please login to view your dashboard. <a href="#" onclick="showLoginModal()">Login here</a></p>
      </div>
    `;
    return;
  }
  
  try {
    const quizzes = await apiRequest('/quizzes');
    
    if (quizzes.length === 0) {
      dashboardContent.innerHTML = `
        <div class="dashboard-empty">
          <i class="fas fa-chart-line"></i>
          <p>No quizzes created yet. <a href="#" onclick="showSection('create')">Create your first quiz!</a></p>
        </div>
      `;
      return;
    }
    
    const quizListHTML = quizzes.map(quiz => {
      const totalResponses = quiz.responses.length;
      const avgScore = totalResponses > 0 ? 
        Math.round(quiz.responses.reduce((sum, r) => sum + r.percentage, 0) / totalResponses) : 0;
      
      return `
        <div class="quiz-item">
          <div class="quiz-item-header">
            <h3>${quiz.title}</h3>
            <div class="quiz-code">Code: ${quiz.code}</div>
          </div>
          
          <div class="quiz-stats">
            <div class="stat-item">
              <div class="stat-number">${quiz.questions.length}</div>
              <div>Questions</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${totalResponses}</div>
              <div>Responses</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${avgScore}%</div>
              <div>Avg Score</div>
            </div>
          </div>
          
          ${totalResponses > 0 ? `
            <div class="results-list">
              <h4>Recent Results:</h4>
              ${quiz.responses.slice(-5).map(response => `
                <div class="result-item" onclick="showDetailedResults('${quiz._id}', '${response.id}')">
                  <span>${response.respondentName}</span>
                  <span class="friendship-score ${getScoreClass(response.percentage)}">
                    ${response.percentage}%
                  </span>
                </div>
              `).join('')}
            </div>
          ` : '<p style="margin-top: 1rem; color: #666;">No responses yet. Share your quiz code!</p>'}
          
          <div style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="copyQuizCode('${quiz.code}')">
              <i class="fas fa-copy"></i> Copy Code
            </button>
            <button class="btn btn-danger" onclick="deleteQuiz('${quiz._id}')" style="margin-left: 0.5rem;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    dashboardContent.innerHTML = `<div class="quiz-list">${quizListHTML}</div>`;
  } catch (error) {
    dashboardContent.innerHTML = `
      <div class="dashboard-empty">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading dashboard. Please try again.</p>
      </div>
    `;
    showNotification(error.message || 'Failed to load dashboard', 'error');
  }
}

function getScoreClass(percentage) {
  if (percentage >= 90) return 'score-excellent';
  if (percentage >= 75) return 'score-good';
  if (percentage >= 60) return 'score-average';
  return 'score-poor';
}

function copyQuizCode(code) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code).then(() => {
      showNotification(`Quiz code ${code} copied to clipboard!`, 'success');
    }).catch((err) => {
      console.error('Clipboard copy failed:', err);
      fallbackCopyQuizCode(code);
    });
  } else {
    fallbackCopyQuizCode(code);
  }
}

function fallbackCopyQuizCode(code) {
  // Create a temporary textarea to copy from
  const textArea = document.createElement('textarea');
  textArea.value = code;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showNotification(`Quiz code ${code} copied to clipboard!`, 'success');
    } else {
      // Final fallback - show a modal with selectable text
      showCopyModal(code);
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showCopyModal(code);
  } finally {
    document.body.removeChild(textArea);
  }
}

function showCopyModal(code) {
  const modalHTML = `
    <div id="copyCodeModal" class="modal" style="display: block;">
      <div class="modal-content">
        <span class="close" onclick="closeCopyModal()">&times;</span>
        <h3><i class="fas fa-copy"></i> Copy Quiz Code</h3>
        <p>Please manually copy the quiz code below:</p>
        <div style="background: #f8f9fa; padding: 1rem; border: 1px solid #ddd; border-radius: 4px; margin: 1rem 0;">
          <input type="text" value="${code}" readonly style="width: 100%; border: none; background: transparent; font-size: 1.2rem; font-weight: bold; text-align: center;" onclick="this.select()" />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          <i class="fas fa-info-circle"></i> Tap/click on the code above to select it, then copy (Ctrl+C or Cmd+C)
        </p>
        <button class="btn btn-primary" onclick="closeCopyModal()">Got it!</button>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('copyCodeModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCopyModal() {
  const modal = document.getElementById('copyCodeModal');
  if (modal) {
    modal.remove();
  }
}

async function deleteQuiz(quizId) {
  if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
    try {
      await apiRequest(`/quizzes/${quizId}`, {
        method: 'DELETE'
      });
      showNotification('Quiz deleted successfully', 'success');
      loadDashboard();
    } catch (error) {
      showNotification(error.message || 'Failed to delete quiz', 'error');
    }
  }
}

// Quiz Code Modal Functions
function showQuizCodeModal(code, title) {
  const content = `
    <div class="quiz-code-display">
      <h3><i class="fas fa-check-circle" style="color: #28a745;"></i> Quiz Created Successfully!</h3>
      <p><strong>${title}</strong></p>
      <div class="code-box">
        <div class="code-text" id="displayCode">${code}</div>
        <p style="margin-top: 1rem; color: #666;">Share this code with your friends!</p>
      </div>
      <div style="margin-top: 2rem;">
        <button class="btn btn-primary" onclick="copyQuizCodeFromModal()">
          <i class="fas fa-copy"></i> Copy Code
        </button>
        <button class="btn btn-secondary" onclick="closeQuizCodeModal(); showSection('dashboard');" style="margin-left: 1rem;">
          <i class="fas fa-tachometer-alt"></i> Go to Dashboard
        </button>
      </div>
    </div>
  `;
  document.getElementById('quizCodeContent').innerHTML = content;
  document.getElementById('quizCodeModal').style.display = 'block';
}

function closeQuizCodeModal() {
  document.getElementById('quizCodeModal').style.display = 'none';
}

function copyQuizCodeFromModal() {
  const code = document.getElementById('displayCode').textContent;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code).then(() => {
      showNotification(`Quiz code ${code} copied to clipboard!`, 'success');
    }).catch((err) => {
      console.error('Clipboard copy failed:', err);
      fallbackCopyQuizCode(code);
    });
  } else {
    fallbackCopyQuizCode(code);
  }
}

// Detailed Results Modal Functions
async function showDetailedResults(quizId, responseId) {
  try {
    const result = await apiRequest(`/quizzes/${quizId}/responses/${responseId}`);
    
    let analysisHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h3><i class="fas fa-user"></i> ${result.respondent}'s Results</h3>
        <div style="font-size: 2rem; color: ${getFriendshipColor(result.percentage)}; font-weight: bold;">
          ${result.percentage}% (${result.score}/${result.questions.length})
        </div>
        <div style="color: ${getFriendshipColor(result.percentage)}; font-weight: 600; margin-top: 0.5rem;">
          ${getFriendshipLevel(result.percentage)}
        </div>
      </div>
      
      <h4 style="margin-bottom: 1rem;"><i class="fas fa-chart-line"></i> Question Analysis:</h4>
    `;
    
    result.questions.forEach((question, index) => {
      analysisHTML += `
        <div class="question-analysis ${question.isCorrect ? 'correct' : 'incorrect'}">
          <div class="question-title">
            <i class="fas fa-${question.isCorrect ? 'check-circle' : 'times-circle'}"></i>
            Question ${index + 1}: ${question.question}
          </div>
          <div class="answer-comparison">
            <div class="answer-item user-answer">
              <strong>Their Answer:</strong><br>
              ${question.options[question.userAnswer]}
            </div>
            <div class="answer-item correct-answer">
              <strong>Correct Answer:</strong><br>
              ${question.options[question.correctAnswer]}
            </div>
          </div>
        </div>
      `;
    });
    
    analysisHTML += `
      <div style="text-align: center; margin-top: 2rem;">
        <button class="btn btn-primary" onclick="closeDetailResultsModal()">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    `;
    
    document.getElementById('detailResultsContent').innerHTML = analysisHTML;
    document.getElementById('detailResultsModal').style.display = 'block';
  } catch (error) {
    showNotification(error.message || 'Failed to load detailed results', 'error');
  }
}

function closeDetailResultsModal() {
  document.getElementById('detailResultsModal').style.display = 'none';
}

// AI Question Generation Functions
function showAIQuestionModal() {
  const creatorName = document.getElementById('creatorName').value.trim();
  if (creatorName) {
    document.getElementById('aiPersonName').value = creatorName;
  }
  document.getElementById('aiQuestionModal').style.display = 'block';
}

function closeAIQuestionModal() {
  document.getElementById('aiQuestionModal').style.display = 'none';
  document.getElementById('aiQuestionResult').style.display = 'none';
  document.getElementById('aiTopic').value = '';
  document.getElementById('aiPersonName').value = '';
}

function generateAIQuestion() {
  const topic = document.getElementById('aiTopic').value.trim();
  const personName = document.getElementById('aiPersonName').value.trim();
  
  if (!topic) {
    showNotification('Please enter a topic for the question', 'error');
    return;
  }
  
  // Enhanced AI generation with multiple questions per topic
  const templates = [
    // Food-related questions
    {
      topics: ['food', 'favorite food', 'cuisine', 'dish', 'eating', 'meal'],
      questions: [
        {
          question: `What is ${personName || "this person"}'s favorite type of cuisine?`,
          options: ['Italian', 'Chinese', 'Mexican', 'Indian']
        },
        {
          question: `What would ${personName || "this person"} order at a restaurant?`,
          options: ['Pizza', 'Burger', 'Salad', 'Pasta']
        },
        {
          question: `What snack does ${personName || "this person"} prefer?`,
          options: ['Chips', 'Chocolate', 'Fruit', 'Cookies']
        }
      ]
    },
    // Color-related questions
    {
      topics: ['color', 'favorite color', 'colours'],
      questions: [
        {
          question: `What is ${personName || "this person"}'s favorite color?`,
          options: ['Blue', 'Red', 'Green', 'Purple']
        },
        {
          question: `What color would ${personName || "this person"} choose for their room?`,
          options: ['Warm tones', 'Cool tones', 'Neutral tones', 'Bright colors']
        },
        {
          question: `What color outfit does ${personName || "this person"} wear most?`,
          options: ['Black', 'White', 'Blue', 'Colorful']
        }
      ]
    },
    // Hobby-related questions
    {
      topics: ['hobby', 'hobbies', 'pastime', 'activity', 'free time'],
      questions: [
        {
          question: `What is ${personName || "this person"}'s favorite hobby?`,
          options: ['Reading', 'Gaming', 'Sports', 'Cooking']
        },
        {
          question: `How does ${personName || "this person"} prefer to spend weekends?`,
          options: ['Outdoors', 'At home', 'With friends', 'Learning new things']
        },
        {
          question: `What creative activity does ${personName || "this person"} enjoy?`,
          options: ['Drawing', 'Writing', 'Photography', 'Music']
        }
      ]
    },
    // Travel-related questions
    {
      topics: ['travel', 'destination', 'vacation', 'place', 'trip'],
      questions: [
        {
          question: `Where would ${personName || "this person"} most like to travel?`,
          options: ['Paris, France', 'Tokyo, Japan', 'New York, USA', 'London, UK']
        },
        {
          question: `What type of vacation does ${personName || "this person"} prefer?`,
          options: ['Beach relaxation', 'Mountain adventure', 'City exploration', 'Cultural immersion']
        },
        {
          question: `How does ${personName || "this person"} like to travel?`,
          options: ['Solo adventure', 'With family', 'With friends', 'Guided tours']
        }
      ]
    },
    // Entertainment questions
    {
      topics: ['movie', 'film', 'cinema', 'entertainment', 'watch'],
      questions: [
        {
          question: `What is ${personName || "this person"}'s favorite movie genre?`,
          options: ['Action', 'Comedy', 'Drama', 'Sci-Fi']
        },
        {
          question: `What does ${personName || "this person"} prefer to watch?`,
          options: ['Movies', 'TV Series', 'Documentaries', 'Anime']
        },
        {
          question: `Where does ${personName || "this person"} like to watch movies?`,
          options: ['Cinema', 'Home', 'Drive-in', 'Outdoor screening']
        }
      ]
    },
    // Music questions
    {
      topics: ['music', 'song', 'artist', 'band', 'listen'],
      questions: [
        {
          question: `What type of music does ${personName || "this person"} prefer?`,
          options: ['Pop', 'Rock', 'Jazz', 'Classical']
        },
        {
          question: `When does ${personName || "this person"} listen to music most?`,
          options: ['While working', 'While exercising', 'While relaxing', 'While traveling']
        },
        {
          question: `How does ${personName || "this person"} discover new music?`,
          options: ['Streaming apps', 'Friends', 'Radio', 'Social media']
        }
      ]
    },
    // Pet/Animal questions
    {
      topics: ['pet', 'animal', 'favorite animal'],
      questions: [
        {
          question: `What is ${personName || "this person"}'s favorite animal?`,
          options: ['Dog', 'Cat', 'Bird', 'Fish']
        },
        {
          question: `What pet would ${personName || "this person"} most like to have?`,
          options: ['Loyal dog', 'Independent cat', 'Colorful bird', 'Low-maintenance fish']
        },
        {
          question: `What animal trait does ${personName || "this person"} admire most?`,
          options: ['Loyalty', 'Independence', 'Playfulness', 'Intelligence']
        }
      ]
    },
    // Season questions
    {
      topics: ['season', 'weather', 'time of year'],
      questions: [
        {
          question: `What is ${personName || "this person"}'s favorite season?`,
          options: ['Spring', 'Summer', 'Autumn', 'Winter']
        },
        {
          question: `What weather does ${personName || "this person"} enjoy most?`,
          options: ['Sunny and warm', 'Cool and breezy', 'Rainy and cozy', 'Snowy and crisp']
        },
        {
          question: `What seasonal activity does ${personName || "this person"} love?`,
          options: ['Beach days', 'Hiking', 'Cozy indoor time', 'Holiday celebrations']
        }
      ]
    }
  ];
  
  // Find matching templates
  const matchingTemplates = templates.filter(template => 
    template.topics.some(t => topic.toLowerCase().includes(t.toLowerCase()))
  );
  
  let generatedQuestions = [];
  
  if (matchingTemplates.length > 0) {
    // Get all questions from matching templates
    matchingTemplates.forEach(template => {
      generatedQuestions.push(...template.questions);
    });
  } else {
    // Generic templates for unknown topics
    generatedQuestions = [
      {
        question: `What does ${personName || "this person"} prefer when it comes to ${topic}?`,
        options: [`Option A about ${topic}`, `Option B about ${topic}`, `Option C about ${topic}`, `Option D about ${topic}`]
      },
      {
        question: `How would ${personName || "this person"} describe their relationship with ${topic}?`,
        options: ['Very passionate', 'Moderately interested', 'Casual interest', 'Not really into it']
      },
      {
        question: `What aspect of ${topic} interests ${personName || "this person"} most?`,
        options: ['The creative side', 'The practical side', 'The social aspect', 'The learning opportunity']
      }
    ];
  }
  
  // Display all generated questions
  const resultHTML = `
    <div class="ai-questions-container">
      <h4><i class="fas fa-magic"></i> Generated Questions for "${topic}":</h4>
      <p style="color: #666; margin-bottom: 1rem;">
        <i class="fas fa-info-circle"></i> Found ${generatedQuestions.length} relevant questions. Click on any question to add it to your quiz.
      </p>
      ${generatedQuestions.map((q, qIndex) => `
        <div class="ai-question-preview" style="margin-bottom: 1.5rem; border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
          <div style="margin-bottom: 0.5rem;">
            <strong>Question ${qIndex + 1}:</strong> ${q.question}
          </div>
          <div style="margin-bottom: 1rem;">
            <strong>Options:</strong>
            <div class="ai-options">
              ${q.options.map((option, index) => `
                <div class="ai-option" onclick="selectAIOption(${qIndex}, ${index})" data-question="${qIndex}" data-index="${index}">
                  ${String.fromCharCode(65 + index)}. ${option}
                </div>
              `).join('')}
            </div>
          </div>
          <div class="ai-question-actions">
            <button class="btn btn-success btn-sm" onclick="useAIQuestion(${qIndex}, '${q.question.replace(/'/g, "\\'")}', '${JSON.stringify(q.options).replace(/"/g, '&quot;')}')" id="useQuestionBtn${qIndex}" disabled>
              <i class="fas fa-check"></i> Add This Question
            </button>
          </div>
        </div>
      `).join('')}
      <div style="margin-top: 1rem; text-align: center;">
        <button class="btn btn-primary" onclick="generateAIQuestion()">
          <i class="fas fa-redo"></i> Generate New Questions
        </button>
        <button class="btn btn-primary" onclick="generateAIQuestion()">
          <i class="fas fa-redo"></i> Generate New Questions
        </button>
        <button class="btn btn-secondary" onclick="closeAIQuestionModal()">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('aiQuestionResult').innerHTML = resultHTML;
  document.getElementById('aiQuestionResult').style.display = 'block';
}

let selectedAICorrectAnswers = {};

function selectAIOption(questionIndex, optionIndex) {
  // Remove previous selection for this question
  document.querySelectorAll(`[data-question="${questionIndex}"]`).forEach(opt => opt.classList.remove('selected'));
  
  // Select current option
  document.querySelector(`[data-question="${questionIndex}"][data-index="${optionIndex}"]`).classList.add('selected');
  selectedAICorrectAnswers[questionIndex] = optionIndex;
  
  // Enable use button for this question
  document.getElementById(`useQuestionBtn${questionIndex}`).disabled = false;
}

function useAIQuestion(questionIndex, question, optionsJson) {
  if (selectedAICorrectAnswers[questionIndex] === undefined) {
    showNotification('Please select the correct answer first', 'warning');
    return;
  }
  
  const options = JSON.parse(optionsJson.replace(/&quot;/g, '"'));
  const correctAnswer = selectedAICorrectAnswers[questionIndex];
  
  // Add the question to the form
  addQuestion();
  
  // Fill in the latest question
  const questionCards = document.querySelectorAll('.question-card');
  const latestCard = questionCards[questionCards.length - 1];
  
  latestCard.querySelector('.question-text').value = question;
  
  const optionInputs = latestCard.querySelectorAll('.option-text');
  options.forEach((option, index) => {
    if (optionInputs[index]) {
      optionInputs[index].value = option;
    }
  });
  
  // Set the correct answer
  const correctRadio = latestCard.querySelector(`input[name="correct${questionCards.length - 1}"][value="${correctAnswer}"]`);
  if (correctRadio) {
    correctRadio.checked = true;
  }
  
  // Close the modal
  closeAIQuestionModal();
  
  // Reset selections
  selectedAICorrectAnswers = {};
  
  showNotification('AI-generated question added successfully!', 'success');
  
  // Scroll to the new question
  latestCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Utility Functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// Close modals when clicking outside
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // Close any open modal
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
});

// Auto-save functionality for quiz creation
function autoSave() {
  if (!currentUser) return;
  
  const creatorName = document.getElementById('creatorName')?.value;
  const quizTitle = document.getElementById('quizTitle')?.value;
  
  if (creatorName || quizTitle) {
    const draftData = {
      userId: currentUser.id,
      creatorName: creatorName,
      quizTitle: quizTitle,
      timestamp: Date.now()
    };
    localStorage.setItem('quizDraft', JSON.stringify(draftData));
  }
}

// Load draft data
function loadDraft() {
  if (!currentUser) return;
  
  const draft = JSON.parse(localStorage.getItem('quizDraft'));
  if (draft && draft.userId === currentUser.id && (Date.now() - draft.timestamp) < 3600000) { // 1 hour
    if (confirm('Found a saved draft. Would you like to continue where you left off?')) {
      document.getElementById('creatorName').value = draft.creatorName || '';
      document.getElementById('quizTitle').value = draft.quizTitle || '';
    }
  }
}

// Initialize draft loading
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(loadDraft, 500);
});

// Auto-save every 30 seconds
setInterval(() => {
  if (document.getElementById('create').classList.contains('active')) {
    autoSave();
  }
}, 30000);

// Certificate Generation Functions
let currentCertificateData = null;

function generateFriendshipCertificate(percentage, friendName, creatorName, quizTitle) {
  currentCertificateData = {
    percentage: percentage,
    friendName: friendName,
    creatorName: creatorName,
    quizTitle: quizTitle,
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };
  
  document.getElementById('certificateModal').style.display = 'block';
  updateCertificatePreview();
}

function closeCertificateModal() {
  document.getElementById('certificateModal').style.display = 'none';
}

function updateCertificatePreview() {
  const canvas = document.getElementById('certificateCanvas');
  const ctx = canvas.getContext('2d');
  const style = document.getElementById('certificateStyle').value;
  
  // Set canvas size
  canvas.width = 800;
  canvas.height = 600;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw certificate based on selected style
  drawCertificate(ctx, canvas.width, canvas.height, style);
}

function drawCertificate(ctx, width, height, style) {
  const data = currentCertificateData;
  
  // Define style configurations
  const styles = {
    elegant: {
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      border: '#d4af37',
      primaryText: '#2c3e50',
      secondaryText: '#34495e',
      accent: '#d4af37'
    },
    modern: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '#5a6fd8',
      primaryText: '#ffffff',
      secondaryText: '#f8f9fa',
      accent: '#ffffff'
    },
    classic: {
      background: 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)',
      border: '#2471a3',
      primaryText: '#ffffff',
      secondaryText: '#ecf0f1',
      accent: '#f39c12'
    },
    friendship: {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      border: '#e91e63',
      primaryText: '#2c3e50',
      secondaryText: '#34495e',
      accent: '#e91e63'
    },
    celebration: {
      background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      border: '#8e44ad',
      primaryText: '#2c3e50',
      secondaryText: '#34495e',
      accent: '#8e44ad'
    }
  };
  
  const currentStyle = styles[style];
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (style === 'elegant') {
    gradient.addColorStop(0, '#f6d365');
    gradient.addColorStop(1, '#fda085');
  } else if (style === 'modern') {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
  } else if (style === 'classic') {
    gradient.addColorStop(0, '#2980b9');
    gradient.addColorStop(1, '#3498db');
  } else if (style === 'friendship') {
    gradient.addColorStop(0, '#ff9a9e');
    gradient.addColorStop(0.5, '#fecfef');
    gradient.addColorStop(1, '#fecfef');
  } else if (style === 'celebration') {
    gradient.addColorStop(0, '#a18cd1');
    gradient.addColorStop(1, '#fbc2eb');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw decorative border
  ctx.strokeStyle = currentStyle.border;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner decorative border
  ctx.strokeStyle = currentStyle.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);
  
  // Draw decorative corners
  drawDecorativeCorners(ctx, currentStyle.accent);
  
  // Certificate title
  ctx.fillStyle = currentStyle.primaryText;
  ctx.font = 'bold 36px Poppins, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 FRIENDSHIP CERTIFICATE 🎉', width / 2, 120);
  
  // Subtitle
  ctx.font = 'italic 18px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.secondaryText;
  ctx.fillText('This certifies that', width / 2, 160);
  
  // Friend's name (large)
  ctx.font = 'bold 42px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.accent;
  ctx.fillText(data.friendName.toUpperCase(), width / 2, 220);
  
  // And text
  ctx.font = 'italic 20px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.secondaryText;
  ctx.fillText('and', width / 2, 260);
  
  // Creator's name
  ctx.font = 'bold 36px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.accent;
  ctx.fillText(data.creatorName.toUpperCase(), width / 2, 310);
  
  // Achievement text
  ctx.font = 'italic 18px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.secondaryText;
  ctx.fillText('are officially certified as', width / 2, 350);
  
  // Friendship level
  const friendshipLevel = getFriendshipLevel(data.percentage);
  ctx.font = 'bold 28px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.primaryText;
  ctx.fillText(friendshipLevel, width / 2, 390);
  
  // Score
  ctx.font = 'bold 48px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.accent;
  ctx.fillText(`${data.percentage}% FRIENDSHIP SCORE`, width / 2, 450);
  
  // Quiz reference
  ctx.font = 'italic 14px Poppins, Arial, sans-serif';
  ctx.fillStyle = currentStyle.secondaryText;
  const quizText = `Based on "${data.quizTitle}"`;
  ctx.fillText(quizText, width / 2, 490);
  
  // Date and signature area
  ctx.font = '16px Poppins, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Date: ${data.date}`, 60, 540);
  
  ctx.textAlign = 'right';
  ctx.fillText('FriendshipQuiz.com', width - 60, 540);
  
  // Add friendship emojis
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💕 👫 🎊 ✨ 💖', width / 2, 520);
}

function drawDecorativeCorners(ctx, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  
  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(60, 60);
  ctx.lineTo(80, 60);
  ctx.stroke();
  
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(720, 80);
  ctx.lineTo(720, 60);
  ctx.lineTo(740, 60);
  ctx.stroke();
  
  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(60, 520);
  ctx.lineTo(60, 540);
  ctx.lineTo(80, 540);
  ctx.stroke();
  
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(720, 520);
  ctx.lineTo(720, 540);
  ctx.lineTo(740, 540);
  ctx.stroke();
}

function downloadCertificate() {
  const canvas = document.getElementById('certificateCanvas');
  const link = document.createElement('a');
  link.download = `friendship-certificate-${currentCertificateData.friendName}-${currentCertificateData.creatorName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  showNotification('Certificate downloaded successfully!', 'success');
}

function shareCertificateWhatsApp() {
  const canvas = document.getElementById('certificateCanvas');
  
  // Convert canvas to blob and create a temporary URL
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = url;
    link.download = 'friendship-certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Show WhatsApp sharing message
    const message = `🎉 ${currentCertificateData.friendName} and ${currentCertificateData.creatorName} are officially certified as ${getFriendshipLevel(currentCertificateData.percentage)} with ${currentCertificateData.percentage}% friendship score! 💕\n\nTest your friendship too at FriendshipQuiz.com! 🎊`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    showNotification('Certificate saved! Please upload the downloaded image to WhatsApp manually.', 'info');
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1000);
  }, 'image/png');
}

function shareCertificateLinkedIn() {
  const canvas = document.getElementById('certificateCanvas');
  
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    
    // Download the certificate
    const link = document.createElement('a');
    link.href = url;
    link.download = 'friendship-certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Prepare LinkedIn post content
    const message = `🎉 Celebrating friendship! ${currentCertificateData.friendName} and ${currentCertificateData.creatorName} scored ${currentCertificateData.percentage}% on a friendship quiz, officially making them ${getFriendshipLevel(currentCertificateData.percentage)}! 💕\n\n#FriendshipDay #BestFriends #FriendshipGoals #Celebration`;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(message)}`;
    
    showNotification('Certificate downloaded! Please upload the image to your LinkedIn post manually.', 'info');
    setTimeout(() => {
      window.open(linkedinUrl, '_blank');
    }, 1000);
  }, 'image/png');
}

function shareCertificateInstagram() {
  const canvas = document.getElementById('certificateCanvas');
  
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    
    // Download the certificate
    const link = document.createElement('a');
    link.href = url;
    link.download = 'friendship-certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Prepare Instagram story caption
    const caption = `🎉 ${currentCertificateData.friendName} and ${currentCertificateData.creatorName} are ${getFriendshipLevel(currentCertificateData.percentage)} with ${currentCertificateData.percentage}% friendship score! 💕✨\n\n#FriendshipDay #BestFriends #FriendshipQuiz #BFF #FriendshipGoals #Certified #FriendshipChallenge`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption).then(() => {
        showNotification('Certificate downloaded and caption copied! Upload the image to your Instagram story and paste the caption.', 'success');
      });
    } else {
      showNotification('Certificate downloaded! Upload the image to Instagram and copy this caption:', 'info');
      prompt('Copy this caption for Instagram:', caption);
    }
  }, 'image/png');
}
