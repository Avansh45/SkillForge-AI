// src/utils/auth.js

<<<<<<< HEAD

=======
>>>>>>> TempBranch
const API_BASE_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
export const getToken = () => {
  return localStorage.getItem('skillforgeToken');
};

// Save auth token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('skillforgeToken', token);
};

// Save current user session (token + user info)
export const saveUserSession = (token, role, name, email) => {
  saveToken(token);
<<<<<<< HEAD

=======
>>>>>>> TempBranch
  const userData = {
    role,
    name,
    email,
    loggedInAt: Date.now(),
  };
<<<<<<< HEAD

  localStorage.setItem('skillforgeUser', JSON.stringify(userData));

=======
  localStorage.setItem('skillforgeUser', JSON.stringify(userData));
>>>>>>> TempBranch
};

// Get current user session
export const getUserSession = () => {
<<<<<<< HEAD

  const raw = localStorage.getItem('skillforgeUser');

=======
  const raw = localStorage.getItem('skillforgeUser');
>>>>>>> TempBranch
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

<<<<<<< HEAD

=======
>>>>>>> TempBranch
// Check if user is authenticated (has valid token)
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUserSession();
  return !!(token && user);
<<<<<<< HEAD

=======
>>>>>>> TempBranch
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getUserSession();
  if (!user) return false;
  return user.role.toLowerCase() === requiredRole.toLowerCase();
};

// Logout user
export const logout = () => {
<<<<<<< HEAD

=======
>>>>>>> TempBranch
  localStorage.removeItem('skillforgeToken');
  localStorage.removeItem('skillforgeUser');
};

// Get authorization header for API calls
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Register new user
export const registerUser = async (role, name, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
<<<<<<< HEAD
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const data = await response.json();

=======
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();
>>>>>>> TempBranch
    if (!response.ok || !data.token) {
      return {
        success: false,
        error: data.message || 'Registration failed',
      };
    }
<<<<<<< HEAD

    // Save session
    saveUserSession(data.token, data.role, data.name, data.email);

=======
    saveUserSession(data.token, data.role, data.name, data.email);
>>>>>>> TempBranch
    return {
      success: true,
      user: {
        role: data.role,
        name: data.name,
        email: data.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

// Login user
<<<<<<< HEAD
export const loginUser = async (role, email, password) => {
=======
export const loginUser = async (email, password, role) => {
>>>>>>> TempBranch
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
<<<<<<< HEAD
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    const data = await response.json();

=======
      body: JSON.stringify({ email, password, role }),
    });
    const data = await response.json();
>>>>>>> TempBranch
    if (!response.ok || !data.token) {
      return {
        success: false,
        error: data.message || 'Login failed',
      };
    }
<<<<<<< HEAD

    // Save session
    saveUserSession(data.token, data.role, data.name, data.email);

=======
    saveUserSession(data.token, data.role, data.name, data.email);
>>>>>>> TempBranch
    return {
      success: true,
      user: {
        role: data.role,
        name: data.name,
        email: data.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

<<<<<<< HEAD
=======
// Change password
export const changePassword = async (email, oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok || !data.token) {
      return {
        success: false,
        error: data.message || 'Password change failed',
      };
    }
    // Save new session
    saveUserSession(data.token, data.role, data.name, data.email);
    return {
      success: true,
      user: {
        role: data.role,
        name: data.name,
        email: data.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
>>>>>>> TempBranch
};

// Get dashboard path based on role
export const getDashboardPath = (role) => {
<<<<<<< HEAD

=======
>>>>>>> TempBranch
  const r = (role || '').toLowerCase();
  if (r === 'instructor') return '/instructor-dashboard';
  if (r === 'admin') return '/admin-dashboard';
  return '/student-dashboard';
<<<<<<< HEAD

};
=======
};
>>>>>>> TempBranch
