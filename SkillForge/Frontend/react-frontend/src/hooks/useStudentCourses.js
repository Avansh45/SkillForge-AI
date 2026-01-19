import { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
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
>>>>>>> TempBranch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
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
=======
    fetchEnrollments();
  }, []);

  return {
    enrolledCourses,
    loading,
    error,
    refetch: fetchEnrollments
  };
};
>>>>>>> TempBranch
