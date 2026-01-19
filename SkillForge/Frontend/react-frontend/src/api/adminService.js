import apiClient from './apiClient';

<<<<<<< HEAD
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
=======
export const getPlatformOverview = async () => {
  return await apiClient.get('/admin/overview');
};

export const getAllUsers = async () => {
  return await apiClient.get('/admin/users');
};

export const updateUserRole = async (userId, role) => {
  return await apiClient.put(`/admin/users/${userId}/role`, { role });
};

export const deleteUser = async (userId) => {
  return await apiClient.delete(`/admin/users/${userId}`);
};

export const deleteCourse = async (courseId) => {
  return await apiClient.delete(`/admin/courses/${courseId}`);
};

export const deleteExam = async (examId) => {
  return await apiClient.delete(`/admin/exams/${examId}`);
};

// NEW: Get detailed platform statistics
export const getPlatformStatistics = async () => {
  return await apiClient.get('/admin/statistics');
};

// NEW: Get exam analytics
export const getExamAnalytics = async () => {
  return await apiClient.get('/admin/exam-analytics');
};

// NEW: Get recent activity feed
export const getRecentActivity = async () => {
  return await apiClient.get('/admin/recent-activity');
};

// NEW: Get course performance summary
export const getCoursePerformance = async () => {
  return await apiClient.get('/admin/course-performance');
};

export const getAllCourses = async () => {
  return await apiClient.get('/admin/courses');
};

export const getAllExams = async () => {
  return await apiClient.get('/admin/exams');
};
>>>>>>> TempBranch
