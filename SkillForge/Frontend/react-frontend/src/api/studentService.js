import apiClient from './apiClient';

export const studentService = {
  getDashboard: () => apiClient.get('/students/dashboard'),
  
  getEnrolledCourses: () => apiClient.get('/students/courses'),
  
  getCourseDetails: (courseId) => apiClient.get(`/students/courses/${courseId}`),
  
  enrollInCourse: (courseId) => apiClient.post(`/students/courses/${courseId}/enroll`),
  
  getExams: () => apiClient.get('/students/exams'),
  
  getExamById: (examId) => apiClient.get(`/students/exams/${examId}`),
  
  startExam: (examId) => apiClient.post(`/students/exams/${examId}/start`),
  
  submitExam: (examId, answers) => apiClient.post(`/students/exams/${examId}/submit`, answers),
  
  getExamResults: (attemptId) => apiClient.get(`/students/exam-attempts/${attemptId}/results`),
  
  getExamHistory: () => apiClient.get('/students/exam-history'),
  
  getResources: (courseId) => apiClient.get(`/students/courses/${courseId}/resources`),
  
  downloadResource: (resourceId) => apiClient.get(`/students/resources/${resourceId}/download`, { responseType: 'blob' }),
  
  getVideos: (courseId) => apiClient.get(`/students/courses/${courseId}/videos`),
  
  getProfile: () => apiClient.get('/students/profile'),
  
  updateProfile: (profileData) => apiClient.put('/students/profile', profileData),
};

export default studentService;
