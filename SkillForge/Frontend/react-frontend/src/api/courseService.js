import apiClient from './apiClient';

export const courseService = {
  getAllCourses: () => apiClient.get('/courses'),
  
  getCourseById: (courseId) => apiClient.get(`/courses/${courseId}`),
  
  createCourse: (courseData) => apiClient.post('/courses', courseData),
  
  updateCourse: (courseId, courseData) => apiClient.put(`/courses/${courseId}`, courseData),
  
  deleteCourse: (courseId) => apiClient.delete(`/courses/${courseId}`),
  
  getInstructorCourses: () => apiClient.get('/courses/instructor'),
  
  getEnrolledStudents: (courseId) => apiClient.get(`/courses/${courseId}/students`),
  
  enrollStudent: (courseId) => apiClient.post(`/courses/${courseId}/enroll`),
  
  unenrollStudent: (courseId, studentId) => apiClient.delete(`/courses/${courseId}/students/${studentId}`),
  
  getCourseResources: (courseId) => apiClient.get(`/courses/${courseId}/resources`),
  
  addCourseResource: (courseId, resourceData) => apiClient.post(`/courses/${courseId}/resources`, resourceData),
  
  deleteCourseResource: (courseId, resourceId) => apiClient.delete(`/courses/${courseId}/resources/${resourceId}`),
};

export default courseService;
