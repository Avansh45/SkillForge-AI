<<<<<<< HEAD
import apiClient from '../api/apiClient';

export const analyticsService = {
  getSystemAnalytics: () => apiClient.get('/analytics/system'),
  
  getCourseAnalytics: (courseId) => apiClient.get(`/analytics/course/${courseId}`),
  
  getStudentAnalytics: (studentId) => apiClient.get(`/analytics/student/${studentId}`),
  
  getExamAnalytics: (examId) => apiClient.get(`/analytics/exam/${examId}`),
  
  getInstructorAnalytics: () => apiClient.get('/analytics/instructor'),
};

export default analyticsService;
=======
// src/services/analyticsService.js
// Analytics API Service - Student, Instructor, and Admin Analytics

import api from './api';

/**
 * Fetch student analytics data
 * Returns comprehensive analytics for the logged-in student
 * @returns {Promise<Object>} Student analytics data
 */
export const getStudentAnalytics = async () => {
  try {
    const response = await api.get('/analytics/student');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Failed to fetch student analytics:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch student analytics',
      data: null,
    };
  }
};

/**
 * Fetch instructor analytics data
 * Returns comprehensive analytics for the logged-in instructor
 * @returns {Promise<Object>} Instructor analytics data
 */
export const getInstructorAnalytics = async () => {
  try {
    const response = await api.get('/analytics/instructor');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Failed to fetch instructor analytics:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch instructor analytics',
      data: null,
    };
  }
};

/**
 * Fetch admin analytics data
 * Returns comprehensive platform-wide analytics for admins
 * @returns {Promise<Object>} Admin analytics data
 */
export const getAdminAnalytics = async () => {
  try {
    const response = await api.get('/analytics/admin');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Failed to fetch admin analytics:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch admin analytics',
      data: null,
    };
  }
};

// Export all functions as default
export default {
  getStudentAnalytics,
  getInstructorAnalytics,
  getAdminAnalytics,
};
>>>>>>> TempBranch
