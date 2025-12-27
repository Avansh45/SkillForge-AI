import apiClient from './apiClient';

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
