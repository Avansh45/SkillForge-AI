import apiClient from './apiClient';

export const adminService = {
  getAllUsers: () => apiClient.get('/admin/users'),
  
  getUserById: (userId) => apiClient.get(`/admin/users/${userId}`),
  
  updateUser: (userId, userData) => apiClient.put(`/admin/users/${userId}`, userData),
  
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  
  getAllCourses: () => apiClient.get('/admin/courses'),
  
  createCourse: (courseData) => apiClient.post('/admin/courses', courseData),
  
  updateCourse: (courseId, courseData) => apiClient.put(`/admin/courses/${courseId}`, courseData),
  
  deleteCourse: (courseId) => apiClient.delete(`/admin/courses/${courseId}`),
  
  getAllExams: () => apiClient.get('/admin/exams'),
  
  getExamById: (examId) => apiClient.get(`/admin/exams/${examId}`),
  
  deleteExam: (examId) => apiClient.delete(`/admin/exams/${examId}`),
  
  getSystemAnalytics: () => apiClient.get('/admin/analytics'),
  
  getUsersByRole: (role) => apiClient.get(`/admin/users/role/${role}`),
};

export default adminService;
