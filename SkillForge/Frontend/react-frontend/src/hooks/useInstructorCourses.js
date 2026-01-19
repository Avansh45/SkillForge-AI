import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { courseService } from '../api/courseService';
=======
import { getInstructorCourses } from '../api/courseService';
>>>>>>> TempBranch

export const useInstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

<<<<<<< HEAD
  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getInstructorCourses();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch instructor courses');
      console.error('Error fetching instructor courses:', err);
=======
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstructorCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load instructor courses:', err);
      setError(err.message || 'Failed to load courses');
      setCourses([]);
>>>>>>> TempBranch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
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

=======
    fetchCourses();
  }, []);

>>>>>>> TempBranch
  return {
    courses,
    loading,
    error,
<<<<<<< HEAD
    refetch: fetchInstructorCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};

export default useInstructorCourses;
=======
    refetch: fetchCourses
  };
};
>>>>>>> TempBranch
