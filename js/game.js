import { Router } from './router.js';

export const Game = {
  currentSolution: null,
  score: 0,
  timerInterval: null,
  timeRemaining: 0,
  currentLevel: 'easy',

  async start(level) {
    Router.go('#/game');
    this.currentLevel = level;

    // Set time based on level
    switch (level) {
      case 'easy': this.timeRemaining = 60; break;
      case 'medium': this.timeRemaining = 45; break;
      case 'hard': this.timeRemaining = 30; break;
      case 'extreme': this.timeRemaining = 20; break;
      default: this.timeRemaining = 60;
    }

    // Reset displays with enhanced styling
    document.getElementById('scoreDisplay').textContent = '0000';
    document.getElementById('timeDisplay').textContent = this.formatTime(this.timeRemaining);
    document.getElementById('levelTitle').textContent = `Level: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
    document.getElementById('levelTitle').style.background = this.getLevelGradient(level);
    document.getElementById('levelTitle').style.webkitBackgroundClip = 'text';
    document.getElementById('levelTitle').style.webkitTextFillColor = 'transparent';
    document.getElementById('levelTitle').style.backgroundClip = 'text';

    this.startTimer();
    await this.loadPuzzle();
  },

  getLevelGradient(level) {
    const gradients = {
      easy: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
      medium: 'linear-gradient(45deg, #FF9800, #FFC107)',
      hard: 'linear-gradient(45deg, #F44336, #E91E63)',
      extreme: 'linear-gradient(45deg, #9C27B0, #673AB7)'
    };
    return gradients[level] || gradients.easy;
  },

  async loadPuzzle() {
    try {
      // Show loading state
      const puzzleImg = document.getElementById('puzzleImage');
      puzzleImg.style.opacity = '0.5';
      
      const res = await fetch('https://marcconrad.com/uob/banana/api.php?out=json');
      const data = await res.json();
      
      puzzleImg.src = data.question;
      puzzleImg.onload = () => {
        puzzleImg.style.opacity = '1';
        puzzleImg.style.animation = 'fadeIn 0.5s ease';
      };
      
      this.currentSolution = String(data.solution);
      document.getElementById('answerInput').value = '';
      document.getElementById('answerInput').focus();
    } catch (err) {
      console.error('Puzzle load failed:', err);
      alert('Could not load puzzle. Check your internet connection.');
    }
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      const timeDisplay = document.getElementById('timeDisplay');
      timeDisplay.textContent = this.formatTime(this.timeRemaining);

      // Visual warning when time is running out
      if (this.timeRemaining <= 10) {
        timeDisplay.style.color = '#e74c3c';
        timeDisplay.style.animation = 'pulse 1s infinite';
      }

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeUp();
      }
    }, 1000);
  },

  handleTimeUp() {
    const gameView = document.getElementById('view-game');
    gameView.style.animation = 'shake 0.5s ease';
    
    setTimeout(() => {
      alert('⏰ Time is up! Better luck next time!');
      Router.go('#/complete');
    }, 500);
  },

  stopTimer() {
    clearInterval(this.timerInterval);
    const timeDisplay = document.getElementById('timeDisplay');
    timeDisplay.style.animation = '';
    timeDisplay.style.color = '';
  },

  formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  },

  async saveScore() {
    console.log('saveScore() called');
    
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User:', user);
    
    if (!user) {
      console.log('No user logged in, score not saved');
      alert('Please login first to save your score!');
      return;
    }

    const timeTaken = this.getInitialTimeForLevel(this.currentLevel) - this.timeRemaining;
    console.log('Saving score data:', {
      username: user.username,
      score: this.score,
      level: this.currentLevel,
      timeTaken: timeTaken
    });
    
    try {
      console.log('Sending request to save_score.php...');
      const response = await fetch('./backend/save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          score: this.score,
          level: this.currentLevel,
          timeTaken: timeTaken
        })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Save score API response:', result);
      
      if (result.success) {
        console.log('Score saved successfully to database');
      } else {
        console.error('Score save failed:', result.message);
      }
      
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  },

  getInitialTimeForLevel(level) {
    const times = { easy: 60, medium: 45, hard: 30, extreme: 20 };
    return times[level] || 60;
  },

  submit() {
    const userAnswer = document.getElementById('answerInput').value.trim();
    console.log('submit() called - User answer:', userAnswer, 'Correct answer:', this.currentSolution);

    if (!userAnswer) {
      this.showFeedback('Please enter an answer!', 'warning');
      return;
    }

    const submitBtn = document.getElementById('submitAnswer');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div> Checking...';
    submitBtn.disabled = true;

    setTimeout(() => {
      if (userAnswer === this.currentSolution) {
        this.handleCorrectAnswer();
      } else {
        this.handleIncorrectAnswer();
      }
      
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1000);
  },

  handleCorrectAnswer() {
    // Calculate score based on time remaining and level
    const levelMultiplier = { easy: 1, medium: 2, hard: 3, extreme: 4 };
    const baseScore = 100 + (this.timeRemaining * 2);
    this.score += Math.floor(baseScore * levelMultiplier[this.currentLevel]);
    
    this.stopTimer();

    // Visual feedback for correct answer
    const gameView = document.getElementById('view-game');
    gameView.classList.add('correct-answer');
    
    document.getElementById('scoreDisplay').textContent = this.score.toString().padStart(4, '0');
    document.getElementById('finalScore').textContent = this.score.toString().padStart(4, '0');
    document.getElementById('finalTime').textContent = document.getElementById('timeDisplay').textContent;

    // Save score when level is completed
    console.log('Calling saveScore()...');
    this.saveScore();
    
    setTimeout(() => {
      gameView.classList.remove('correct-answer');
      Router.go('#/complete');
    }, 1000);
  },

  handleIncorrectAnswer() {
    console.log('Incorrect answer');
      alert('Incorrect! Try again.');
    }
  }
