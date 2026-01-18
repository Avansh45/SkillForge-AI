import { useState, useEffect } from 'react';
import { courseService } from '../api/courseService';

export const useInstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getInstructorCourses();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch instructor courses');
      console.error('Error fetching instructor courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const createCourse = async (courseData) => {
    try {
      await courseService.createCourse(courseData);
      await fetchInstructorCourses();
    } catch (err) {
      throw err;
    }
  };

  const updateCourse = async (courseId, courseData) => {
    try {
      await courseService.updateCourse(courseId, courseData);
      await fetchInstructorCourses();
    } catch (err) {
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await courseService.deleteCourse(courseId);
      await fetchInstructorCourses();
    } catch (err) {
      throw err;
    }
  };

  return {
    courses,
    loading,
    error,
    refetch: fetchInstructorCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};

export default useInstructorCourses;
