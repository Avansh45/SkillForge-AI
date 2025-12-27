import apiClient from './apiClient';

export const getStudentProfile = async () => {
  return await apiClient.get('/students/me');
};

export const getStudentDashboard = async () => {
  return await apiClient.get('/students/dashboard');
};

export const getStudentEnrollments = async () => {
  return await apiClient.get('/students/enrollments');
};

export const enrollInCourse = async (courseId) => {
  return await apiClient.post(`/students/enroll/${courseId}`);
};

export const unenrollFromCourse = async (courseId) => {
  return await apiClient.post(`/students/unenroll/${courseId}`);
};
