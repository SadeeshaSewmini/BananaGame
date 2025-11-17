export const Auth = {
  async login({ username, password }) {
    try {
      console.log('Attempting login for user:', username);
      
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Use FormData instead of JSON
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('./backend/login.php', {
        method: 'POST',
        body: formData
      });
      
      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Login successful, user saved:', data.user);
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed: ' + error.message);
    }
  },

  async register({ username, email, password }) {
    try {
      console.log('Attempting registration for user:', username);
      
      // Use FormData for registration too
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('./backend/register.php', {
        method: 'POST',
        body: formData
      });
      
      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);
      
      if (data.success) {
        // Auto-login after registration
        const user = { username, id: null };
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Registration successful, user saved:', user);
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed: ' + error.message);
    }
  },

  logout() {
    localStorage.removeItem('user');
    console.log('User logged out');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};