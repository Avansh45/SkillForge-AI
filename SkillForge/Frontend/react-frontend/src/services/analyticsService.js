import apiClient from '../api/apiClient';

export const analyticsService = {
  getSystemAnalytics: () => apiClient.get('/analytics/system'),
  
  getCourseAnalytics: (courseId) => apiClient.get(`/analytics/course/${courseId}`),
  
  getStudentAnalytics: (studentId) => apiClient.get(`/analytics/student/${studentId}`),
  
  getExamAnalytics: (examId) => apiClient.get(`/analytics/exam/${examId}`),
  
  getInstructorAnalytics: () => apiClient.get('/analytics/instructor'),
};

export default analyticsService;
