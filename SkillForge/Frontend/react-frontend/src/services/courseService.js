// src/services/courseService.js
// Course Management API Service

import api from './api';

/**
 * Get all courses (public endpoint)
 * @returns {Promise<Object>} List of all courses
 */
export const getAllCourses = async () => {
  try {
    const response = await api.get('/courses');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch courses',
    };
  }
};

/**
 * Get course by ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course details
 */
export const getCourseById = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch course details',
    };
  }
};

/**
 * Get instructor's courses
 * @returns {Promise<Object>} List of instructor's courses
 */
export const getInstructorCourses = async () => {
  try {
    const response = await api.get('/instructors/courses');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch instructor courses',
    };
  }
};

/**
 * Get instructor dashboard data
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getInstructorDashboard = async () => {
  try {
    const response = await api.get('/instructors/dashboard');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch dashboard data',
    };
  }
};

/**
 * Create new course (Instructor only)
 * @param {Object} courseData - Course information
 * @param {string} courseData.title - Course title
 * @param {string} courseData.description - Course description
 * @param {string} courseData.category - Course category
 * @param {number} courseData.duration - Course duration in hours
 * @returns {Promise<Object>} Created course
 */
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses', courseData);
    return {
      success: true,
      data: response,
      message: 'Course created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create course',
    };
  }
};

/**
 * Update existing course (Instructor only)
 * @param {number} courseId - Course ID
 * @param {Object} courseData - Updated course information
 * @returns {Promise<Object>} Updated course
 */
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return {
      success: true,
      data: response,
      message: 'Course updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update course',
    };
  }
};

/**
 * Delete course (Instructor only)
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return {
      success: true,
      data: response,
      message: 'Course deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete course',
    };
  }
};

/**
 * Get student's enrolled courses
 * @returns {Promise<Object>} List of enrolled courses
 */
export const getStudentCourses = async () => {
  try {
    const response = await api.get('/students/courses');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch enrolled courses',
    };
  }
};

/**
 * Enroll student in a course
 * @param {number} courseId - Course ID to enroll in
 * @returns {Promise<Object>} Enrollment confirmation
 */
export const enrollInCourse = async (courseId) => {
  try {
    const response = await api.post('/enrollments', { courseId });
    return {
      success: true,
      data: response,
      message: 'Successfully enrolled in course',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to enroll in course',
    };
  }
};

/**
 * Check enrollment status for a course
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Enrollment status
 */
export const checkEnrollmentStatus = async (courseId) => {
  try {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return {
      success: true,
      data: response,
      isEnrolled: response.enrolled === true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to check enrollment status',
      isEnrolled: false,
    };
  }
};

/**
 * Unenroll from a course
 * @param {number} enrollmentId - Enrollment ID
 * @returns {Promise<Object>} Unenrollment confirmation
 */
export const unenrollFromCourse = async (enrollmentId) => {
  try {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return {
      success: true,
      data: response,
      message: 'Successfully unenrolled from course',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to unenroll from course',
    };
  }
};

/**
 * Get course progress for student
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course progress data
 */
export const getCourseProgress = async (courseId) => {
  try {
    const response = await api.get(`/performance/course/${courseId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch course progress',
    };
  }
};

/**
 * Get course videos
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} List of course videos
 */
export const getCourseVideos = async (courseId) => {
  try {
    const response = await api.get(`/videos/course/${courseId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch course videos',
    };
  }
};
