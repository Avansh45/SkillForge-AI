// src/utils/auth.js

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
  const userData = {
    role,
    name,
    email,
    loggedInAt: Date.now(),
  };
  localStorage.setItem("skillforgeUser", JSON.stringify(userData));
};

// Get current user session
export const getUserSession = () => {
  const raw = localStorage.getItem("skillforgeUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

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
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getUserSession();
  if (!user) return false;
  return user.role.toLowerCase() === requiredRole.toLowerCase();
};

// Logout user
export const logout = () => {
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
};

// Get dashboard path based on role
export const getDashboardPath = (role) => {
  const r = (role || "").toLowerCase();
  if (r === "instructor") return "/instructor-dashboard";
  if (r === "admin") return "/admin-dashboard";
  return "/student-dashboard";
};