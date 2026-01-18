import { useState, useEffect } from 'react';
import { studentService } from '../api/studentService';

export const useStudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await studentService.getEnrolledCourses();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enrolled courses');
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const enrollInCourse = async (courseId) => {
    try {
      await studentService.enrollInCourse(courseId);
      await fetchEnrolledCourses();
    } catch (err) {
      throw err;
    }
  };

  return {
    courses,
    loading,
    error,
    refetch: fetchEnrolledCourses,
    enrollInCourse,
  };
};

export default useStudentCourses;
