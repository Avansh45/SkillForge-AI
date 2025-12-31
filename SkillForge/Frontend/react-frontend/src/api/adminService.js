import apiClient from './apiClient';

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
