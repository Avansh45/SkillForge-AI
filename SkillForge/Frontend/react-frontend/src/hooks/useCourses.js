import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { courseService } from '../api/courseService';
=======
import { getAllCourses } from '../api/courseService';
>>>>>>> TempBranch

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
<<<<<<< HEAD
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
=======
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err.message || 'Failed to load courses');
      setCourses([]);
>>>>>>> TempBranch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

<<<<<<< HEAD
  return { courses, loading, error, refetch: fetchCourses };
};

export default useCourses;
=======
  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
};
>>>>>>> TempBranch
