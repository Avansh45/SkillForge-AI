import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes for AI generation (supports up to 100 questions)
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() >= payload.exp * 1000) {
          logout();
          window.location.href = '/login';
        }
      } catch (e) {
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (!error.response) {
      if (!navigator.onLine) {
        error.message = 'No internet connection. Please check your network.';
      } else if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please try again.';
      } else {
        error.message = 'Network error. Please try again.';
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        logout();
        window.location.href = '/login';
        error.message = 'Session expired. Please login again.';
        break;

      case 403:
        error.message = 'You do not have permission to perform this action. Please ensure you are logged in with the correct role.';
        break;

      case 404:
        error.message = data?.message || 'Resource not found.';
        break;

      case 500:
        error.message = data?.message || 'Server error. Please try again later.';
        break;

      default:
        error.message = data?.message || error.message || 'Request failed.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
