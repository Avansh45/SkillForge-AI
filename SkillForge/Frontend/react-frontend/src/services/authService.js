// src/services/authService.js
// Authentication API Service - Login, Register, Session Management

import api from './api';
import { saveUserSession, logout as clearSession } from '../utils/auth';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User role (STUDENT, INSTRUCTOR, ADMIN)
 * @returns {Promise<Object>} Response with token and user info
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Save session if registration successful
    if (response.token) {
      saveUserSession(response.token, response.role, response.name, response.email);
    }
    
    return {
      success: true,
      data: response,
      user: {
        name: response.name,
        email: response.email,
        role: response.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
};

/**
 * Login user with email and password
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Response with token and user info
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Save session if login successful
    if (response.token) {
      saveUserSession(response.token, response.role, response.name, response.email);
    }
    
    return {
      success: true,
      data: response,
      user: {
        name: response.name,
        email: response.email,
        role: response.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
};

/**
 * Logout user - Clear session and redirect
 */
export const logout = () => {
  clearSession();
  window.location.href = '/login';
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get user profile',
    };
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return {
      success: true,
      data: response,
      message: 'Password changed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to change password',
    };
  }
};

/**
 * Request password reset
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return {
      success: true,
      data: response,
      message: 'Password reset link sent to your email',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to request password reset',
    };
  }
};

/**
 * Reset password with token
 * @param {Object} resetData - Reset data
 * @param {string} resetData.token - Reset token from email
 * @param {string} resetData.newPassword - New password
 * @returns {Promise<Object>} Response
 */
export const resetPassword = async (resetData) => {
  try {
    const response = await api.post('/auth/reset-password', resetData);
    return {
      success: true,
      data: response,
      message: 'Password reset successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to reset password',
    };
  }
};

/**
 * Verify email address
 * @param {string} token - Verification token from email
 * @returns {Promise<Object>} Response
 */
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return {
      success: true,
      data: response,
      message: 'Email verified successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to verify email',
    };
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<Object>} Response with new token
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    
    if (response.token) {
      saveUserSession(response.token, response.role, response.name, response.email);
    }
    
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to refresh token',
    };
  }
};
