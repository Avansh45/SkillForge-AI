import apiClient from '../api/apiClient';

export const courseService = {
  getAllCourses: () => apiClient.get('/courses'),
  
  getCourseById: (courseId) => apiClient.get(`/courses/${courseId}`),
  
  createCourse: (courseData) => apiClient.post('/courses', courseData),
  
  updateCourse: (courseId, courseData) => apiClient.put(`/courses/${courseId}`, courseData),
  
  deleteCourse: (courseId) => apiClient.delete(`/courses/${courseId}`),
  
  getInstructorCourses: () => apiClient.get('/instructor/courses'),
  
  getEnrolledStudents: (courseId) => apiClient.get(`/courses/${courseId}/students`),
  
  enrollStudent: (courseId) => apiClient.post(`/enrollment/${courseId}/enroll`),
  
  unenrollStudent: (courseId, studentId) => apiClient.delete(`/enrollment/${courseId}/students/${studentId}`),
};

export default courseService;
