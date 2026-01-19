<<<<<<< HEAD
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

=======
// src/services/api.js
// Centralized Axios API Client with JWT authentication

import axios from 'axios';
import { getToken, logout } from '../utils/auth';

// Base API URL
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default configuration
>>>>>>> TempBranch
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
<<<<<<< HEAD
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
=======
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
      
      // Check if token is expired (optional but recommended)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expirationTime) {
          logout();
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }
      } catch (error) {
        // Token parsing failed
      }
    }
    
>>>>>>> TempBranch
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
=======
// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Return only the data from response
    return response.data;
  },
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      if (!navigator.onLine) {
        error.message = 'No internet connection. Please check your network.';
      } else if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please try again.';
      } else {
        error.message = 'Network error. Server is not reachable.';
      }
      return Promise.reject(error);
    }

    // HTTP error responses
    const { status, data } = error.response;

    switch (status) {
      case 400:
        error.message = data?.message || 'Bad request. Please check your input.';
        break;

      case 401:
        // Unauthorized - token invalid or expired
        error.message = 'Session expired. Please login again.';
        logout();
        window.location.href = '/login';
        break;

      case 403:
        // Forbidden - insufficient permissions
        error.message = data?.message || 'You do not have permission to perform this action.';
        break;

      case 404:
        error.message = data?.message || 'Resource not found.';
        break;

      case 409:
        error.message = data?.message || 'Conflict. Resource already exists.';
        break;

      case 500:
        error.message = data?.error || data?.message || 'Server error. Please try again later.';
        break;

      case 503:
        error.message = 'Service temporarily unavailable. Please try again later.';
        break;

      default:
        error.message = data?.message || data?.error || error.message || 'Request failed.';
    }

>>>>>>> TempBranch
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
export default api;
=======
// Export configured axios instance
export default api;

// Export helper function to make requests with custom config
export const makeRequest = async (config) => {
  try {
    const response = await api(config);
    return { success: true, data: response };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Request failed',
      details: error.response?.data 
    };
  }
};

// Export API base URL for direct fetch calls if needed
export { API_BASE_URL };
>>>>>>> TempBranch
