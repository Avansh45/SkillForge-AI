import apiClient from './apiClient';

<<<<<<< HEAD
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
=======
export const getAllCourses = async () => {
  return await apiClient.get('/courses');
};

export const getInstructorCourses = async () => {
  return await apiClient.get('/instructors/courses');
};

export const getCourseById = async (courseId) => {
  return await apiClient.get(`/courses/${courseId}`);
};

export const createCourse = async (courseData) => {
  return await apiClient.post('/courses', courseData);
};

export const updateCourse = async (courseId, courseData) => {
  return await apiClient.put(`/courses/${courseId}`, courseData);
};

export const deleteCourse = async (courseId) => {
  return await apiClient.delete(`/courses/${courseId}`);
};

export const getInstructorDashboard = async () => {
  return await apiClient.get('/instructors/dashboard');
};
>>>>>>> TempBranch
