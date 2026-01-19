import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import { useCourses, useStudentCourses } from '../hooks';
import { enrollInCourse, unenrollFromCourse } from '../api/studentService';
import { getCourseVideos } from '../api/videoService';
import { getStudentExams } from '../api/examService';
import { getCourseResources, downloadResource, openResourceInNewTab } from '../services/resourceService';
import { getStudentAnalytics } from '../services/analyticsService';
import {
  getStudentAssignments,
  submitAssignment,
  getMySubmission,
  validateAssignmentFile,
  formatDueDate,
  formatFileSize,
  isAssignmentOverdue,
  downloadSubmission
} from '../services/assignmentService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Settings from './Settings';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [courseResources, setCourseResources] = useState({});
  const [loadingResources, setLoadingResources] = useState({});
  const [showResourcesFor, setShowResourcesFor] = useState({});
  
  // Assignment states
  const [selectedCourseForAssignments, setSelectedCourseForAssignments] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [assignmentFiles, setAssignmentFiles] = useState({});
  
  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const { courses: allCourses, loading: loadingCourses } = useCourses();
  const { enrolledCourses, loading: loadingEnrollments, refetch: refetchEnrollments } = useStudentCourses();

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    fetchExams();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const result = await getStudentAnalytics();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setAnalyticsError(result.error);
        console.error('Failed to fetch analytics:', result.error);
      }
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const examData = await getStudentExams();
      setExams(Array.isArray(examData) ? examData : []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      await refetchEnrollments();
      alert('✅ Successfully enrolled in course!');
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to enroll in course. Please try again.'));
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    try {
      await unenrollFromCourse(courseId);
      await refetchEnrollments();
      alert('✅ Successfully unenrolled from course');
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to unenroll from course. Please try again.'));
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.course?.id === courseId);
  };

  const handleViewVideos = async (course) => {
    setSelectedCourse(course);
    setLoadingVideos(true);
    try {
      const videos = await getCourseVideos(course.id);
      setCourseVideos(Array.isArray(videos) ? videos : []);
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to load videos. Please try again.'));
      setCourseVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleCloseVideos = () => {
    setSelectedCourse(null);
    setCourseVideos([]);
  };

  const handleToggleResources = async (courseId) => {
    // Toggle visibility
    setShowResourcesFor(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));

    // If opening and resources not loaded yet, fetch them
    if (!showResourcesFor[courseId] && !courseResources[courseId]) {
      await fetchCourseResources(courseId);
    }
  };

  const fetchCourseResources = async (courseId) => {
    setLoadingResources(prev => ({ ...prev, [courseId]: true }));
    try {
      const result = await getCourseResources(courseId);
      if (result.success) {
        setCourseResources(prev => ({
          ...prev,
          [courseId]: Array.isArray(result.data) ? result.data : []
        }));
      } else {
        alert('❌ ' + (result.error || 'Failed to load resources'));
        setCourseResources(prev => ({ ...prev, [courseId]: [] }));
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      alert('❌ Failed to load resources');
      setCourseResources(prev => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoadingResources(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleViewResource = async (resourceId) => {
    try {
      await openResourceInNewTab(resourceId);
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to open resource'));
    }
  };

  const handleDownloadResource = async (resourceId, fileName) => {
    try {
      const result = await downloadResource(resourceId, fileName);
      if (!result.success) {
        alert('❌ ' + (result.error || 'Failed to download resource'));
      }
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to download resource'));
    }
  };

  // ==========================================
  // ASSIGNMENT HANDLERS
  // ==========================================

  const handleViewAssignments = async (course) => {
    setSelectedCourseForAssignments(course);
    setLoadingAssignments(true);
    try {
      const result = await getStudentAssignments(course.id);
      if (result.success) {
        const assignments = Array.isArray(result.data) ? result.data : [];
        setCourseAssignments(assignments);
        // Backend already provides submission status for each assignment
        // No need for separate API calls
      } else {
        alert('❌ ' + result.error);
        setCourseAssignments([]);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      alert('❌ Failed to load assignments');
      setCourseAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleFileSelect = (assignmentId, file) => {
    const validation = validateAssignmentFile(file);
    if (!validation.valid) {
      alert('❌ ' + validation.error);
      return;
    }
    setAssignmentFiles(prev => ({ ...prev, [assignmentId]: file }));
  };

  const handleSubmitAssignment = async (assignment) => {
    const file = assignmentFiles[assignment.id];
    if (!file) {
      alert('❌ Please select a PDF file to submit');
      return;
    }

    if (!confirm(`Submit assignment "${assignment.title}"? You can only submit once.`)) {
      return;
    }

    setSubmittingAssignment(assignment.id);
    try {
      const result = await submitAssignment(assignment.id, file);
      if (result.success) {
        alert('✅ Assignment submitted successfully!');
        // Clear file and refresh assignments
        setAssignmentFiles(prev => ({ ...prev, [assignment.id]: null }));
        await handleViewAssignments(selectedCourseForAssignments);
      } else {
        alert('❌ ' + result.error);
      }
    } catch (err) {
      alert('❌ Failed to submit assignment. Please try again.');
    } finally {
      setSubmittingAssignment(null);
    }
  };

  const handleCloseAssignments = () => {
    setSelectedCourseForAssignments(null);
    setCourseAssignments([]);
    setAssignmentFiles({});
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getEmbedUrl = (url, videoType) => {
    if (!url) return null;
    
    if (videoType === 'YOUTUBE') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    return url;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSectionChange = (targetKey) => {
    if (targetKey === 'settings') {
      navigate('/settings');
      return;
    }
    setActiveSection(targetKey);
    const block = document.querySelector(`[data-section="${targetKey}"]`);
    if (block && headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      const rect = block.getBoundingClientRect();
      const offset = window.pageYOffset + rect.top - headerHeight - 8;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const navItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: 'Courses' },
    { key: 'exams', label: 'Exams' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <>
      <header ref={headerRef}>
        <div className="container">
          <div className="topbar">
            <div className="logo-area">
              <div className="logo-circle">S</div>
              <div className="brand-text">
                <span>SkillForge</span>
                <span>Adaptive Learning Platform</span>
              </div>
            </div>

            <div className="dash-title">
<<<<<<< HEAD

=======
>>>>>>> TempBranch
              <strong>Student Dashboard</strong>
            </div>

            <div className="user-area">
              <span className="muted">{user?.name || 'Student'}</span>
<<<<<<< HEAD

=======
>>>>>>> TempBranch
              <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

<<<<<<< HEAD
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">

=======
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
>>>>>>> TempBranch
          <Navbar
            items={navItems}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
<<<<<<< HEAD

        </aside>

        <main className="dashboard-main">
          <div className="container">

=======
        </aside>

        <main className="dashboard-main">
          <div className="container">
>>>>>>> TempBranch
          <section id="studentSection">
            {/* Overview Section */}
            <div className="section-block" data-section="overview">
              <span className="pill">Student dashboard</span>
              <h1 className="section-block-title">Today's snapshot</h1>
              <p className="section-block-sub">
                Track your active courses, upcoming exams and AI recommendations to plan your day.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h2>📊 Performance Analytics</h2>
                    <p className="card-sub">Your learning progress and achievements</p>
                    {loadingAnalytics ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading analytics...
                      </div>
                    ) : analyticsError ? (
                      <div style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                          <strong>Error Loading Analytics</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>{analyticsError}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Stat Cards Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                              {analytics?.courses?.totalEnrolled || 0}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Active Courses</div>
                          </div>
                          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                              {analytics?.exams?.totalAttempts || 0}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Exams Taken</div>
                          </div>
                          <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                              {analytics?.assignments?.totalSubmitted || 0}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Assignments</div>
                          </div>
                        </div>

                        {/* Overall Progress */}
                        <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Overall Progress</h4>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>Across all enrolled courses</p>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                              {analytics?.overallProgress?.overallProgressPercentage?.toFixed(1) || '0'}%
                            </div>
                          </div>
                          <div style={{ width: '100%', height: '12px', background: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${analytics?.overallProgress?.overallProgressPercentage || 0}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a 0%, #15803d 100%)', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>

                        {/* Exam Performance */}
                        <div style={{ padding: '1.5rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e40af' }}>🎯 Exam Performance</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Average Score</div>
                              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: (analytics?.exams?.averagePercentage || 0) >= 70 ? '#16a34a' : (analytics?.exams?.averagePercentage || 0) >= 50 ? '#f59e0b' : '#dc2626' }}>
                                {analytics?.exams?.averagePercentage?.toFixed(1) || '0'}%
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.5rem' }}>
                                <div style={{ width: `${analytics?.exams?.averagePercentage || 0}%`, height: '100%', background: (analytics?.exams?.averagePercentage || 0) >= 70 ? '#16a34a' : (analytics?.exams?.averagePercentage || 0) >= 50 ? '#f59e0b' : '#dc2626', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Completion Rate</div>
                              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6' }}>
                                {analytics?.exams?.uniqueExamsAttempted || 0}
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.5rem' }}>
                                <div style={{ width: `${Math.min((analytics?.exams?.uniqueExamsAttempted || 0) * 10, 100)}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Assignment Stats */}
                        <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#92400e' }}>📝 Assignment Progress</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Submitted</div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                                {analytics?.assignments?.totalSubmitted || 0} / {analytics?.assignments?.graded || 0}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Average Score</div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {analytics?.assignments?.averageGradePercentage?.toFixed(1) || '0'}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>📚 Active Courses</h3>
                    <p className="card-sub">Your enrolled courses and progress</p>
                    {loadingAnalytics ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading courses...
                      </div>
                    ) : !analytics?.courses?.coursesList || analytics.courses.coursesList.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
                        <p style={{ margin: 0, fontWeight: '500' }}>No courses yet</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Enroll in courses to start learning</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                        {analytics.courses.coursesList.map((course) => (
                          <div key={course.courseId} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{course.courseTitle}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                  {course.videosCount || 0} videos · {course.assignmentsCount || 0} assignments
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a' }}>
                                  {course.progressPercentage?.toFixed(0) || 0}%
                                </div>
                              </div>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${course.progressPercentage || 0}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a 0%, #15803d 100%)', transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card" style={{ marginTop: '1rem' }}>
                    <h3>🎯 Recent Activity</h3>
                    <p className="card-sub">Your latest learning activities</p>
                    {loadingAnalytics ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
                        Loading activity...
                      </div>
                    ) : !analytics?.exams?.recentAttempts || analytics.exams.recentAttempts.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No recent activity</p>
                      </div>
                    ) : (
                      <ul className="list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {analytics.exams.recentAttempts.slice(0, 5).map((activity, index) => (
                          <li key={index} style={{ alignItems: 'flex-start', padding: '0.75rem', borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>📝</span>
                                <strong style={{ fontSize: '0.9rem' }}>{activity.examTitle}</strong>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#666', marginLeft: '1.75rem' }}>
                                {activity.courseTitle} · {new Date(activity.attemptDate).toLocaleDateString()}
                              </div>
                            </div>
                            {activity.score !== undefined && (
                              <div style={{ 
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: activity.score >= 70 ? '#dcfce7' : activity.score >= 50 ? '#fef3c7' : '#fee2e2',
                                color: activity.score >= 70 ? '#166534' : activity.score >= 50 ? '#92400e' : '#991b1b'
                              }}>
                                {activity.score}%
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Section */}
            <div className="section-block" data-section="courses">
              <h2 className="section-block-title">Courses & Learning Paths</h2>
              <p className="section-block-sub">
                Browse all available courses and manage your enrollments.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>My Enrolled Courses</h3>
                    <p className="card-sub">Courses you are currently enrolled in.</p>
                    {loadingEnrollments ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading your enrollments...
                      </div>
                    ) : enrolledCourses.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                        <p style={{ margin: 0 }}>You haven't enrolled in any courses yet.</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Browse available courses on the right to get started!</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {enrolledCourses.map((enrollment) => (
                          <div key={enrollment.id} className="card" style={{ padding: '1rem', background: '#f8f9fa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <div>
                                <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{enrollment.course?.title || 'Unknown Course'}</span>
                                {enrollment.course?.description && (
                                  <span className="label" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                                    {enrollment.course.description}
                                  </span>
                                )}
                                <span className="label" style={{ display: 'block', marginTop: '0.25rem' }}>
                                  Progress: {enrollment.progressPercentage || 0}%
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                  onClick={() => handleViewVideos(enrollment.course)}
                                >
                                  View Videos
                                </button>
                                <button 
                                  className="btn btn-info" 
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                  onClick={() => handleViewAssignments(enrollment.course)}
                                >
                                  📝 Assignments
                                </button>
                                <button 
                                  className="btn btn-outline" 
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#d32f2f', borderColor: '#d32f2f' }}
                                  onClick={() => handleUnenroll(enrollment.course?.id)}
                                >
                                  Unenroll
                                </button>
                              </div>
                            </div>

                            {/* Course Resources Section */}
                            <div style={{ borderTop: '1px solid #ddd', paddingTop: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>📄 Course Resources</h4>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                  onClick={() => handleToggleResources(enrollment.course?.id)}
                                >
                                  {showResourcesFor[enrollment.course?.id] ? 'Hide' : 'Show'}
                                </button>
                              </div>

                              {showResourcesFor[enrollment.course?.id] && (
                                <div style={{ marginTop: '0.5rem' }}>
                                  {loadingResources[enrollment.course?.id] ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                      <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>⏳</div>
                                      Loading resources...
                                    </div>
                                  ) : !courseResources[enrollment.course?.id] || courseResources[enrollment.course?.id].length === 0 ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#666', background: '#fff', borderRadius: '6px' }}>
                                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📭</div>
                                      <p style={{ margin: 0, fontSize: '0.875rem' }}>No resources available yet</p>
                                    </div>
                                  ) : (
                                    <div style={{ background: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
                                      <table style={{ width: '100%', fontSize: '0.875rem' }}>
                                        <thead>
                                          <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>File Name</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Size</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Uploaded</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {courseResources[enrollment.course?.id].map((resource) => (
                                            <tr key={resource.id} style={{ borderBottom: '1px solid #eee' }}>
                                              <td style={{ padding: '0.5rem' }}>
                                                <div style={{ fontWeight: '500' }}>{resource.title}</div>
                                              </td>
                                              <td style={{ padding: '0.5rem', color: '#666' }}>
                                                {formatFileSize(resource.fileSize)}
                                              </td>
                                              <td style={{ padding: '0.5rem', color: '#666' }}>
                                                {formatDate(resource.createdAt)}
                                              </td>
                                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                  <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleViewResource(resource.id)}
                                                    title="View PDF in new tab"
                                                  >
                                                    View
                                                  </button>
                                                  <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleDownloadResource(resource.id, resource.title)}
                                                    title="Download PDF"
                                                  >
                                                    Download
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Available Courses</h3>
                    <p className="card-sub">Browse and enroll in new courses.</p>
                    {loadingCourses ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading available courses...
                      </div>
                    ) : allCourses.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                        <p style={{ margin: 0 }}>No courses available at the moment.</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Check back later for new courses!</p>
                      </div>
                    ) : (
                      <ul className="list">
                        {allCourses.map((course) => (
                          <li key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: '500' }}>{course.title}</span>
                              {course.description && (
                                <span className="label" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                                  {course.description}
                                </span>
                              )}
                              {isEnrolled(course.id) && (
                                <span className="chip" style={{ marginTop: '0.25rem', display: 'inline-block', fontSize: '0.75rem' }}>
                                  Enrolled
                                </span>
                              )}
                            </div>
                            {!isEnrolled(course.id) && (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                onClick={() => handleEnroll(course.id)}
                                disabled={enrolling === course.id}
                              >
                                {enrolling === course.id ? 'Enrolling...' : 'Enroll'}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Exams Section */}
            <div className="section-block" data-section="exams">
              <h2 className="section-block-title">My Exams</h2>
              <p className="section-block-sub">
                View upcoming exams and quickly revise recent attempts.
              </p>

              {loadingExams ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                  Loading exams...
                </div>
              ) : exams.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '1.125rem' }}>No Exams Available</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Enroll in courses to see available exams.</p>
                </div>
              ) : (
                <div className="grid">
                  {/* Available Exams - Can be attempted now */}
                  <div>
                    <div className="card">
                      <h3>Available Exams</h3>
                      <p className="card-sub">Ready to take now.</p>
                      {(() => {
                        const availableExams = exams.filter(exam => {
                          return exam.attemptCount < exam.maxAttempts;
                        });

                        if (availableExams.length === 0) {
                          return (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                              <p style={{ margin: 0, fontWeight: '500' }}>All exams attempted</p>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Check back later for new assessments.</p>
                            </div>
                          );
                        }

                        return (
                          <ul className="list">
                            {availableExams.map(exam => {
                              return (
                                <li key={exam.id} style={{ alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <strong>{exam.title}</strong>
                                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                      {exam.course?.title}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                      {exam.durationMinutes ? `${exam.durationMinutes} mins` : 'Duration not set'}
                                      {exam.totalQuestions && ` · ${exam.totalQuestions} questions`}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                                      {exam.attemptCount} of {exam.maxAttempts} attempts used
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                    <button
                                      className="btn btn-primary"
                                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                                      onClick={() => navigate(`/exam/${exam.id}`)}
                                    >
                                      {exam.attemptCount > 0 ? 'Retake Exam' : 'Take Exam'}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Completed Exams */}
                  <div>
                    <div className="card">
                      <h3>Completed Exams</h3>
                      <p className="card-sub">Review your results.</p>
                      {(() => {
                        const completedExams = exams.filter(exam => {
                          return exam.hasAttempted;
                        });

                        if (completedExams.length === 0) {
                          return (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                              <p style={{ margin: 0, fontWeight: '500' }}>No completed exams</p>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Your exam history will appear here.</p>
                            </div>
                          );
                        }

                        return (
                          <ul className="list">
                            {completedExams.map(exam => {
                              const canRetake = exam.attemptCount < exam.maxAttempts;
                              
                              return (
                                <li key={exam.id} style={{ alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <strong>{exam.title}</strong>
                                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                      {exam.course?.title}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                      <span style={{ 
                                        color: exam.latestScore >= 70 ? '#16a34a' : exam.latestScore >= 50 ? '#f59e0b' : '#dc2626',
                                        fontWeight: '600'
                                      }}>
                                        {exam.latestScore ? `${exam.latestScore.toFixed(1)}%` : 'N/A'}
                                      </span>
                                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                                        ({exam.attemptCount} attempt{exam.attemptCount !== 1 ? 's' : ''})
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    {canRetake ? (
                                      <button
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                        onClick={() => navigate(`/exam/${exam.id}`)}
                                      >
                                        Retake
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
                                        Max attempts reached
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Section */}
            <div className="section-block" data-section="analytics">
              <h2 className="section-block-title">Analytics & Insights</h2>
              <p className="section-block-sub">
                Understand your strengths and weak areas with AI-driven analysis.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Skill-wise Performance</h3>
                    <p className="card-sub">Performance breakdown across key skill areas.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No performance data yet</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Complete exams to see your skill analysis.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Learning Preferences</h3>
                    <p className="card-sub">How the system schedules and recommends practice.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚙️</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No preferences set</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Configure your learning preferences in settings.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Recommendations</h3>
                    <p className="card-sub">Next actions generated from your recent history.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No recommendations yet</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>AI recommendations will appear after completing exams.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>
<<<<<<< HEAD

=======
>>>>>>> TempBranch
          </div>
        </main>
      </div>

<<<<<<< HEAD
=======
      {/* Video Viewer Modal */}
      {selectedCourse && (
        <div className="modal-backdrop" onClick={handleCloseVideos}>
          <div className="modal" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={handleCloseVideos}>×</span>
            <h3>Course Videos - {selectedCourse.title}</h3>
            <p>Watch course videos and learn at your own pace</p>

            <div className="card">
              {loadingVideos ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                  Loading videos...
                </div>
              ) : courseVideos.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎥</div>
                  <p style={{ margin: 0, fontWeight: '500' }}>No videos available yet</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>The instructor hasn't added any videos to this course yet. Check back later!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {courseVideos.map((video) => (
                    <div key={video.id} className="card" style={{ padding: '1rem', background: '#f8f9fa' }}>
                      <h4 style={{ marginBottom: '0.5rem' }}>{video.title}</h4>
                      {video.description && (
                        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
                          {video.description}
                        </p>
                      )}
                      
                      {video.videoType === 'YOUTUBE' && video.externalUrl && (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                          <iframe
                            src={getEmbedUrl(video.externalUrl, video.videoType)}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={video.title}
                          />
                        </div>
                      )}
                      
                      {video.videoType === 'EXTERNAL' && video.externalUrl && (
                        <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px' }}>
                          <a 
                            href={video.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ display: 'inline-block' }}
                          >
                            Open External Video Link →
                          </a>
                        </div>
                      )}
                      
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                        Type: {video.videoType}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCourseForAssignments && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#333' }}>📝 Assignments - {selectedCourseForAssignments.title}</h3>
              <button onClick={handleCloseAssignments} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>

            {loadingAssignments ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                <p style={{ marginTop: '1rem', color: '#666' }}>Loading assignments...</p>
              </div>
            ) : courseAssignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}><p>📭 No assignments available for this course yet.</p></div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {courseAssignments.map(assignment => {
                  // Backend provides all submission data in assignment object
                  const isSubmitted = assignment.submitted === true;
                  const isOverdue = isAssignmentOverdue(assignment.dueDate);
                  const selectedFile = assignmentFiles[assignment.id];
                  return (
                    <div key={assignment.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', background: isSubmitted ? '#f0f9ff' : '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{assignment.title}</h4>
                          <div style={{ fontSize: '0.875rem', color: '#666', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span>📅 Due: {formatDueDate(assignment.dueDate)}</span>
                            <span>💯 Max Marks: {assignment.maxMarks}</span>
                            {isOverdue && !isSubmitted && <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>⏰ Overdue</span>}
                          </div>
                        </div>
                        <div style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: isSubmitted ? (assignment.graded ? '#4caf50' : '#ff9800') : (isOverdue ? '#d32f2f' : '#2196f3'), color: '#fff' }}>
                          {isSubmitted ? (assignment.graded ? '✅ GRADED' : '📝 SUBMITTED') : (isOverdue ? '⏰ OVERDUE' : '⏳ PENDING')}
                        </div>
                      </div>
                      <p style={{ margin: '0 0 1rem 0', color: '#555', fontSize: '0.95rem' }}>{assignment.description}</p>
                      {!isSubmitted && (
                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#555' }}>📤 Submit Your Work</h5>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', minWidth: '200px' }}>
                              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#666' }}>Select PDF File (Max 5MB)</label>
                              <input type="file" accept=".pdf" onChange={(e) => handleFileSelect(assignment.id, e.target.files[0])} style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.875rem' }} disabled={submittingAssignment === assignment.id || isOverdue} />
                              {selectedFile && <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#666' }}>✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})</div>}
                            </div>
                            <button className="btn btn-primary" onClick={() => handleSubmitAssignment(assignment)} disabled={!selectedFile || submittingAssignment === assignment.id || isOverdue} style={{ padding: '0.5rem 1.5rem', opacity: (!selectedFile || submittingAssignment === assignment.id || isOverdue) ? 0.5 : 1 }}>{submittingAssignment === assignment.id ? '📤 Submitting...' : '📤 Submit'}</button>
                          </div>
                          {isOverdue && <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#ffebee', borderRadius: '4px', fontSize: '0.875rem', color: '#d32f2f' }}>⚠️ This assignment is overdue. Submissions are no longer accepted.</div>}
                        </div>
                      )}
                      {isSubmitted && (
                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#555' }}>📋 Your Submission</h5>
                          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}><strong>Submitted:</strong><span>{new Date(assignment.submittedAt).toLocaleString()}</span></div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}><strong>File:</strong><a href="#" onClick={async (e) => { e.preventDefault(); const result = await downloadSubmission(assignment.submissionId, assignment.fileName); if (!result.success) alert('❌ ' + result.error); }} style={{ color: '#2196f3', textDecoration: 'underline' }}>{assignment.fileName} ⬇</a></div>
                            {assignment.graded && (
                              <>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}><strong>Marks:</strong><span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1rem' }}>{assignment.marksAwarded} / {assignment.maxMarks}</span></div>
                                {assignment.feedback && <div style={{ marginTop: '0.5rem' }}><strong>Feedback:</strong><div style={{ marginTop: '0.25rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>{assignment.feedback}</div></div>}
                              </>
                            )}
                            {!assignment.graded && <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fff3e0', borderRadius: '4px', color: '#f57c00' }}>⏳ Your submission is pending review by the instructor.</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
>>>>>>> TempBranch

      <Footer />
    </>
  );
};

export default StudentDashboard;
