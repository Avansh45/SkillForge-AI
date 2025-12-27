import { useState, useEffect } from 'react';
import { getStudentEnrollments } from '../api/studentService';

export const useStudentCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentEnrollments();
      setEnrolledCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      setError(err.message || 'Failed to load enrolled courses');
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrolledCourses,
    loading,
    error,
    refetch: fetchEnrollments
  };
};
