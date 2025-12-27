import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        error.message = 'You do not have permission to perform this action.';
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

    console.error('API Error:', {
      status,
      message: error.message,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
