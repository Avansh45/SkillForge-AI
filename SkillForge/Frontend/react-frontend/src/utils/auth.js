// src/utils/auth.js

<<<<<<< HEAD
// Get all users from localStorage
export const getUsersStore = () => {
  const raw = localStorage.getItem("skillforgeUsers");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch (e) {
    return {};
  }
};

// Save all users to localStorage
export const setUsersStore = (store) => {
  localStorage.setItem("skillforgeUsers", JSON.stringify(store));
};

// Save current user session
export const saveUserSession = (role, name, email) => {
=======
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
>>>>>>> aacea16 (Merge TempBranch changes)
  const userData = {
    role,
    name,
    email,
    loggedInAt: Date.now(),
  };
<<<<<<< HEAD
  localStorage.setItem("skillforgeUser", JSON.stringify(userData));
=======
  localStorage.setItem('skillforgeUser', JSON.stringify(userData));
>>>>>>> aacea16 (Merge TempBranch changes)
};

// Get current user session
export const getUserSession = () => {
<<<<<<< HEAD
  const raw = localStorage.getItem("skillforgeUser");
=======
  const raw = localStorage.getItem('skillforgeUser');
>>>>>>> aacea16 (Merge TempBranch changes)
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

<<<<<<< HEAD
// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getUserSession();
  if (!user) return false;

  // Check session timeout (2 hours)
  const maxAgeMs = 2 * 60 * 60 * 1000;
  if (user.loggedInAt && Date.now() - user.loggedInAt > maxAgeMs) {
    logout();
    return false;
  }

  return true;
=======
// Check if user is authenticated (has valid token)
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUserSession();
  return !!(token && user);
>>>>>>> aacea16 (Merge TempBranch changes)
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
  localStorage.removeItem("skillforgeUser");
};

// Register new user
export const registerUser = (role, name, email, password) => {
  const store = getUsersStore();
  const key = email.toLowerCase();

  // Check if user already exists
  const existing = store[key];
  if (existing && existing.role !== role) {
    return {
      success: false,
      error: `This email is already registered as ${existing.role}. Please sign up or login as ${existing.role}.`,
    };
  }

  if (existing && existing.role === role) {
    return {
      success: false,
      error: "Account already exists for this role. Please login instead.",
    };
  }

  // Create new user
  const newUser = { role, name, email, password };
  store[key] = newUser;
  setUsersStore(store);

  return { success: true };
};

// Login user
export const loginUser = (role, email, password) => {
  const store = getUsersStore();
  const key = email.toLowerCase();
  const user = store[key];

  if (!user) {
    return {
      success: false,
      error: "No account found with this email. Please sign up first.",
    };
  }

  if (user.role !== role) {
    return {
      success: false,
      error: `This email is registered as ${user.role}. Please select the ${user.role} role to login.`,
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      error: "Incorrect password.",
    };
  }

  return { success: true, user };
=======
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
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      return {
        success: false,
        error: data.message || 'Registration failed',
      };
    }

    // Save session
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
};

// Login user
export const loginUser = async (role, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      return {
        success: false,
        error: data.message || 'Login failed',
      };
    }

    // Save session
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
>>>>>>> aacea16 (Merge TempBranch changes)
};

// Get dashboard path based on role
export const getDashboardPath = (role) => {
<<<<<<< HEAD
  const r = (role || "").toLowerCase();
  if (r === "instructor") return "/instructor-dashboard";
  if (r === "admin") return "/admin-dashboard";
  return "/student-dashboard";
=======
  const r = (role || '').toLowerCase();
  if (r === 'instructor') return '/instructor-dashboard';
  if (r === 'admin') return '/admin-dashboard';
  return '/student-dashboard';
>>>>>>> aacea16 (Merge TempBranch changes)
};