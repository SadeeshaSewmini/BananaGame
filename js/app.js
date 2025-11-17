import { Router } from './router.js';
import { Auth } from './auth.js';
import { Game } from './game.js';

// Enhanced OTP generation with visual feedback
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Visual feedback for OTP generation
  const otpDisplay = document.getElementById('otpDisplay');
  if (otpDisplay) {
    otpDisplay.style.transform = 'scale(0.8)';
    setTimeout(() => {
      otpDisplay.style.transform = 'scale(1)';
    }, 300);
  }
  
  return otp;
}

// Celebration effect for level completion
function createCelebration() {
  const celebration = document.createElement('div');
  celebration.className = 'celebration';
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    celebration.appendChild(confetti);
  }
  
  document.body.appendChild(celebration);
  
  setTimeout(() => {
    celebration.remove();
  }, 3000);
}

// Enhanced loading scores with visual feedback
async function loadScores() {
  console.log('loadScores() called');
  
  const scoresBody = document.getElementById('scoresBody');
  if (scoresBody) {
    scoresBody.innerHTML = '<tr><td colspan="3" style="text-align: center;"><div class="loading"></div> Loading scores...</td></tr>';
  }
  
  try {
    console.log('Fetching scores from backend...');
    const response = await fetch('./backend/get_scores.php');
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    if (data.success) {
      console.log('Scores data received:', data.scores);
      const tbody = document.getElementById('scoresBody');
      console.log('Table body element:', tbody);
      
      tbody.innerHTML = '';
      
      if (data.scores.length === 0) {
        console.log('No scores found in database');
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3" style="text-align: center; padding: 40px; color: #666;">No scores yet. Be the first to play! 🎮</td>`;
        tbody.appendChild(row);
      } else {
        data.scores.forEach((score, index) => {
          console.log('Adding score:', score);
          const row = document.createElement('tr');
          row.style.animationDelay = (index * 0.1) + 's';
          row.style.animation = 'slideUp 0.5s ease-out forwards';
          row.innerHTML = `
            <td>${score.username}</td>
            <td>${score.score}</td>
            <td>${score.level}</td>
          `;
          tbody.appendChild(row);
        });
      }
      
      console.log('Scores loaded successfully');
    } else {
      console.error('Failed to load scores:', data.message);
      scoresBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #e74c3c;">Failed to load scores. Please try again.</td></tr>';
    }
  } catch (error) {
    console.error('Error loading scores:', error);
    scoresBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #e74c3c;">Network error. Please check your connection.</td></tr>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  Router.init();

  // Enhanced splash screen with better interaction
  const splash = document.getElementById('view-splash');
  if (splash) {
    splash.addEventListener('click', () => {
      splash.style.animation = 'fadeOut 1s forwards';
      setTimeout(() => {
        splash.remove();
        Router.go('#/login');
      }, 1000);
    });
    
    // Add keyboard support for splash screen
    document.addEventListener('keypress', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        splash.click();
      }
    });
  }

  // Enhanced login form
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();
    
    // Visual feedback
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div> Logging in...';
    submitBtn.disabled = true;
    
    try {
      const loginSuccess = await Auth.login({ username, password });
      if (loginSuccess) {
        // Generate and display OTP
        const otp = generateOTP();
        localStorage.setItem('pendingOTP', otp);
        document.getElementById('otpDisplay').textContent = otp;
        Router.go('#/otp');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Enhanced OTP Verification
  const otpForm = document.getElementById('otpForm');
  otpForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredOTP = e.target.otp.value.trim();
    const storedOTP = localStorage.getItem('pendingOTP');
    
    // Visual feedback
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div> Verifying...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      if (enteredOTP === storedOTP) {
        localStorage.removeItem('pendingOTP');
        submitBtn.innerHTML = '✅ Verified!';
        setTimeout(() => {
          Router.go('#/menu');
        }, 1000);
      } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Invalid OTP! Please try again.');
        e.target.otp.value = '';
        e.target.otp.focus();
      }
    }, 1500);
  });

  // Enhanced registration
  const registerForm = document.getElementById('registerForm');
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();
    const confirm = e.target.confirm.value.trim();
    
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    
    // Visual feedback
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div> Creating account...';
    submitBtn.disabled = true;
    
    try {
      await Auth.register({ username, email, password });
      // Generate OTP for registration too
      const otp = generateOTP();
      localStorage.setItem('pendingOTP', otp);
      document.getElementById('otpDisplay').textContent = otp;
      Router.go('#/otp');
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Enhanced navigation with smooth transitions
  document.getElementById('goRegister')?.addEventListener('click', () => Router.go('#/register'));
  document.getElementById('backToLogin')?.addEventListener('click', () => Router.go('#/login'));
  document.getElementById('logout')?.addEventListener('click', () => {
    Auth.logout();
    Router.go('#/login');
  });

  // Enhanced level selection
  document.getElementById('select-level')?.addEventListener('click', () => Router.go('#/level'));

  // Enhanced level buttons with visual feedback
  document.querySelectorAll('#view-level button[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.level.toLowerCase();
      
      // Visual feedback
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
        Game.start(level);
      }, 150);
    });
  });

  document.getElementById('playAgain')?.addEventListener('click', () => {
    Game.start(Game.currentLevel);
  });

  // Enhanced game start
  document.getElementById('start-game')?.addEventListener('click', () => {
    Game.score = 0;
    Game.start('easy');
  });

  // Enhanced answer submission
  document.getElementById('submitAnswer')?.addEventListener('click', () => Game.submit());

  // Enhanced Next Level with celebration
  document.getElementById('nextLevel')?.addEventListener('click', () => {
    const order = ['easy', 'medium', 'hard', 'extreme'];
    const currentIndex = order.indexOf(Game.currentLevel);
    const nextIndex = currentIndex + 1;
    if (nextIndex < order.length) {
      createCelebration();
      setTimeout(() => {
        Game.start(order[nextIndex]);
      }, 1000);
    } else {
      createCelebration();
      setTimeout(() => {
        alert('🎉 You finished all levels! You are a Banana Math Master! 🍌');
        Router.go('#/menu');
      }, 1500);
    }
  });

  // Enhanced scores view
  document.getElementById("view-scores-button")?.addEventListener("click", () => {
    console.log('View Scores button clicked');
    loadScores();
    Router.go("#/scores");
  });

  document.getElementById('backToLevels')?.addEventListener('click', () => {
    Router.go('#/level');
  });

  // Enhanced back to menu buttons
  document.getElementById('backToMenu')?.addEventListener('click', () => {
    Router.go('#/menu');
  });

  document.getElementById('backFromScores')?.addEventListener('click', () => {
    Router.go('#/menu');
  });

  // Enhanced back to login from OTP screen
  document.getElementById('backToLoginFromOTP')?.addEventListener('click', () => {
    localStorage.removeItem('pendingOTP');
    Router.go('#/login');
  });

  // Add input validation for answer input
  const answerInput = document.getElementById('answerInput');
  answerInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // Submit answer in game view
      if (document.getElementById('view-game')?.classList.contains('active')) {
        Game.submit();
      }
    }
  });
});