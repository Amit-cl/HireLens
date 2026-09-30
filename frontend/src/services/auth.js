const TOKEN_KEY = 'hirelens_token';
const USER_KEY = 'hirelens_user';

export const authService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  setSession: (authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse));
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  register: async (name, email, password, role = 'USER') => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    authService.setSession(data);
    return data;
  },

  login: async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Invalid credentials');
    }

    authService.setSession(data);
    return data;
  },

  fetchProfile: async () => {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Session expired');
    }

    return data;
  }
};
