import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Settings from './Settings';
import { 
  getPlatformOverview, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  getPlatformStatistics,
  getExamAnalytics,
  getRecentActivity,
  getCoursePerformance,
  getAllCourses,
  getAllExams,
  deleteCourse,
  deleteExam
} from '../api/adminService';
import { useCourses } from '../hooks';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const headerRef = useRef(null);
  
  const [overview, setOverview] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [examAnalytics, setExamAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingStatistics, setLoadingStatistics] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingOverview(true);
      setLoadingStatistics(true);
      setLoadingActivity(true);
      setLoadingUsers(true);
      setLoadingCourses(true);
      setLoadingExams(true);
      
      const [overviewData, statsData, activityData, usersData, performanceData, coursesData, examsData] = await Promise.all([
        getPlatformOverview(),
        getPlatformStatistics(),
        getRecentActivity(),
        getAllUsers(),
        getCoursePerformance(),
        getAllCourses(),
        getAllExams()
      ]);
      
      setOverview(overviewData);
      setStatistics(statsData);
      setRecentActivity(activityData || []);
      setUsers(usersData || []);
      setCoursePerformance(performanceData || []);
      setCourses(coursesData || []);
      setExams(examsData || []);
    } catch (error) {
      alert(`❌ Failed to load dashboard data: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoadingOverview(false);
      setLoadingStatistics(false);
      setLoadingActivity(false);
      setLoadingUsers(false);
      setLoadingCourses(false);
      setLoadingExams(false);
    }
  };

  const handleManageUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await updateUserRole(selectedUser.id, newRole);
      alert('✅ User role updated successfully!');
      handleCloseModal();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('❌ Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteUser(userId);
      alert('✅ User deleted successfully!');
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Failed to delete user. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all related exams, enrollments, and videos. This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCourse(courseId);
      alert('✅ Course deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('❌ Failed to delete course: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? This will also delete all questions and student attempts. This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteExam(examId);
      alert('✅ Exam deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('❌ Failed to delete exam: ' + (error.response?.data?.error || error.message));
    }
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
    { key: 'analytics', label: 'Analytics' },
    { key: 'courses', label: 'Courses / Batches' },
    { key: 'exams', label: 'Exams' },
    { key: 'users', label: 'Users' },
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
              <strong>Admin Dashboard</strong>
            </div>

            <div className="user-area">
              <span className="muted">{user?.name || 'Admin'}</span>
              <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <Navbar
            items={navItems}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </aside>

        <main className="dashboard-main">
          <div className="container">
          <section id="adminSection">
            {/* Overview Section */}
            <div className="section-block" data-section="overview">
              <span className="pill">Admin dashboard</span>
              <h1 className="section-block-title">Institute overview</h1>
              <p className="section-block-sub">
                Monitor user growth, platform usage and assessment activity across the institute.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h2>Platform Summary</h2>
                    <p className="card-sub">Key numbers across your organisation.</p>
                    {loadingStatistics ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading statistics...
                      </div>
                    ) : (
                      <div className="stat-row">
                        <div className="stat-pill">
                          <strong>{statistics?.totalUsers || 0}</strong>
                          Total users
                        </div>
                        <div className="stat-pill">
                          <strong>{statistics?.totalCourses || 0}</strong>
                          Active courses
                        </div>
                        <div className="stat-pill">
                          <strong>{statistics?.examsThisMonth || 0}</strong>
                          Exams conducted this month
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3>User Roles</h3>
                    <p className="card-sub">Breakdown of user types.</p>
                    {loadingOverview ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading user data...
                      </div>
                    ) : (
                      <ul className="list">
                        <li>
                          <span>Students</span>
                          <span className="label">{overview?.students || 0}</span>
                        </li>
                        <li>
                          <span>Instructors</span>
                          <span className="label">{overview?.instructors || 0}</span>
                        </li>
                        <li>
                          <span>Admins</span>
                          <span className="label">{overview?.admins || 0}</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Activity Highlights</h3>
                    <p className="card-sub">Recent activity on the platform.</p>
                    {loadingActivity ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading activity...
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📈</div>
                        <p style={{ margin: 0, fontWeight: '500' }}>No activity data yet</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Activity metrics will appear as users engage with the platform.</p>
                      </div>
                    ) : (
                      <ul className="list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {recentActivity.slice(0, 10).map((activity, index) => (
                          <li key={index} style={{ alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{ 
                                  fontSize: '1.25rem',
                                  lineHeight: 1
                                }}>
                                  {activity.type === 'EXAM_ATTEMPT' ? '📝' : '📚'}
                                </span>
                                <strong style={{ fontSize: '0.9rem' }}>
                                  {activity.studentName}
                                </strong>
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginLeft: '1.75rem' }}>
                                {activity.type === 'EXAM_ATTEMPT' ? (
                                  <>
                                    Completed <strong>{activity.examTitle}</strong>
                                    <span style={{ 
                                      marginLeft: '0.5rem',
                                      color: activity.status === 'PASSED' ? '#16a34a' : '#dc2626',
                                      fontWeight: '600'
                                    }}>
                                      {activity.score?.toFixed(1)}%
                                    </span>
                                  </>
                                ) : (
                                  <>Enrolled in <strong>{activity.courseTitle}</strong></>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#999', marginLeft: '1.75rem', marginTop: '0.25rem' }}>
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <span style={{ 
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: activity.type === 'EXAM_ATTEMPT' 
                                ? (activity.status === 'PASSED' ? '#dcfce7' : '#fee2e2')
                                : '#dbeafe',
                              color: activity.type === 'EXAM_ATTEMPT'
                                ? (activity.status === 'PASSED' ? '#166534' : '#991b1b')
                                : '#1e40af'
                            }}>
                              {activity.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Analytics Section - NEW */}
            <div className="section-block" data-section="analytics">
              <h2 className="section-block-title">Exam Analytics</h2>
              <p className="section-block-sub">
                Performance metrics and statistics across all exams.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Overall Exam Statistics</h3>
                    <p className="card-sub">Key exam metrics across the platform.</p>
                    {loadingStatistics ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading statistics...
                      </div>
                    ) : (
                      <div className="stat-row">
                        <div className="stat-pill">
                          <strong>{statistics?.totalExams || 0}</strong>
                          Total Exams
                        </div>
                        <div className="stat-pill">
                          <strong>{statistics?.totalExamAttempts || 0}</strong>
                          Total Attempts
                        </div>
                        <div className="stat-pill">
                          <strong>{statistics?.averageExamScore?.toFixed(1) || 0}%</strong>
                          Avg. Score
                        </div>
                        <div className="stat-pill">
                          <strong>{statistics?.totalQuestions || 0}</strong>
                          Total Questions
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3>Course Performance</h3>
                    <p className="card-sub">Enrollment and performance by course.</p>
                    {loadingStatistics ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading performance data...
                      </div>
                    ) : coursePerformance.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                        <p style={{ margin: 0, fontWeight: '500' }}>No course data yet</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Course performance will appear when courses are created.</p>
                      </div>
                    ) : (
                      <ul className="list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {coursePerformance.map((course) => (
                          <li key={course.courseId} style={{ alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <strong>{course.courseTitle}</strong>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                Instructor: {course.instructorName}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                {course.totalEnrollments} enrollments · {course.totalExams} exams
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: 'bold',
                                color: course.averageScore >= 70 ? '#16a34a' : course.averageScore >= 50 ? '#f59e0b' : '#dc2626'
                              }}>
                                {course.averageScore?.toFixed(1)}%
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>Avg. Score</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Platform Insights</h3>
                    <p className="card-sub">Quick overview of platform metrics.</p>
                    {loadingStatistics ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading insights...
                      </div>
                    ) : (
                      <ul className="list">
                        <li>
                          <div>
                            <strong>Total Enrollments</strong>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>Students enrolled in courses</div>
                          </div>
                          <span className="label" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {statistics?.totalEnrollments || 0}
                          </span>
                        </li>
                        <li>
                          <div>
                            <strong>Exams This Month</strong>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>Exams attempted in current month</div>
                          </div>
                          <span className="label" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a' }}>
                            {statistics?.examsThisMonth || 0}
                          </span>
                        </li>
                        <li>
                          <div>
                            <strong>Average Score</strong>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>Platform-wide exam average</div>
                          </div>
                          <span className="label" style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 'bold',
                            color: (statistics?.averageExamScore || 0) >= 70 ? '#16a34a' : '#f59e0b'
                          }}>
                            {statistics?.averageExamScore?.toFixed(1) || 0}%
                          </span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Management Section */}
            <div className="section-block" data-section="courses">
              <h2 className="section-block-title">Course Management</h2>
              <p className="section-block-sub">
                View and manage all courses on the platform.
              </p>
              
              <div className="card">
                {loadingCourses ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Loading courses...
                  </div>
                ) : courses && courses.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <p style={{ padding: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                      Showing {courses.length} course(s)
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem' }}>Course Title</th>
                          <th style={{ padding: '0.75rem' }}>Instructor</th>
                          <th style={{ padding: '0.75rem' }}>Enrollments</th>
                          <th style={{ padding: '0.75rem' }}>Exams</th>
                          <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <strong>{course.title}</strong>
                              {course.description && (
                                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                  {course.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {course.instructorName}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span className="pill" style={{
                                background: course.enrollmentCount > 0 ? '#10b981' : '#e0e0e0',
                                color: course.enrollmentCount > 0 ? 'white' : '#666',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                              }}>
                                {course.enrollmentCount}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {course.examCount}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#dc2626', borderColor: '#dc2626' }}
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>No courses found</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Instructors need to create courses.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Exams Management Section */}
            <div className="section-block" data-section="exams">
              <h2 className="section-block-title">Exam Management</h2>
              <p className="section-block-sub">
                View and manage all exams on the platform.
              </p>
              
              <div className="card">
                {loadingExams ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Loading exams...
                  </div>
                ) : exams && exams.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <p style={{ padding: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                      Showing {exams.length} exam(s)
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem' }}>Exam Title</th>
                          <th style={{ padding: '0.75rem' }}>Course</th>
                          <th style={{ padding: '0.75rem' }}>Instructor</th>
                          <th style={{ padding: '0.75rem' }}>Duration</th>
                          <th style={{ padding: '0.75rem' }}>Questions</th>
                          <th style={{ padding: '0.75rem' }}>Attempts</th>
                          <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((exam) => (
                          <tr key={exam.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <strong>{exam.title}</strong>
                              {exam.description && (
                                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                                  {exam.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.courseTitle}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.instructorName}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.durationMinutes ? `${exam.durationMinutes} mins` : 'Not set'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.totalQuestions || 0}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span className="pill" style={{
                                background: exam.attemptsCount > 0 ? '#10b981' : '#e0e0e0',
                                color: exam.attemptsCount > 0 ? 'white' : '#666',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                              }}>
                                {exam.attemptsCount || 0}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', color: '#dc2626', borderColor: '#dc2626' }}
                                onClick={() => handleDeleteExam(exam.id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>No exams found</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Instructors need to create exams.</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Management Section */}
            <div className="section-block" data-section="users">
              <h2 className="section-block-title">User Management</h2>
              <p className="section-block-sub">
                Manage all users on the platform - update roles and remove users.
              </p>
              
              <div className="card">
                {loadingUsers ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Loading users...
                  </div>
                ) : users && users.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <p style={{ padding: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                      Showing {users.length} user(s)
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem' }}>Name</th>
                          <th style={{ padding: '0.75rem' }}>Email</th>
                          <th style={{ padding: '0.75rem' }}>Role</th>
                          <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '0.75rem' }}>{u.name}</td>
                              <td style={{ padding: '0.75rem' }}>{u.email}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span className="pill" style={{ 
                                  background: u.role === 'ADMIN' ? '#3b82f6' : u.role === 'INSTRUCTOR' ? '#10b981' : '#6366f1',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <button 
                                  className="btn btn-outline" 
                                  style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                                  onClick={() => handleManageUser(u)}
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>No users found</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Check console for errors or verify backend is running.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Section */}
            <div className="section-block" data-section="analytics">
              <h2 className="section-block-title">Institute Analytics</h2>
              <p className="section-block-sub">
                High-level trends across courses, batches and users.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Engagement Trends</h3>
                    <p className="card-sub">Recent patterns in how users interact with the platform.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No engagement data yet</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Analytics will appear as users engage with the platform.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Learning Preferences</h3>
                    <p className="card-sub">How the system schedules and recommends practice.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚙️</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No preferences data</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>User preferences will be analyzed over time.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Risk Indicators</h3>
                    <p className="card-sub">Signals where intervention may be needed.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No risk indicators</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Risk analysis will appear after sufficient activity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>
          </div>
        </main>
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={handleCloseModal}>×</span>
            <h3>Manage User</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Update role or remove user from the platform</p>

            <div className="card" style={{ padding: '1rem', background: '#f8f9fa', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Name:</strong> {selectedUser.name}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div>
                <strong>Current Role:</strong> 
                <span className="pill" style={{ 
                  marginLeft: '0.5rem',
                  background: selectedUser.role === 'ADMIN' ? '#3b82f6' : selectedUser.role === 'INSTRUCTOR' ? '#10b981' : '#6366f1',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="newRole">New Role</label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateRole}
                style={{ flex: 1 }}
              >
                Update Role
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleCloseModal}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                ⚠️ Danger Zone
              </p>
              <button 
                className="btn btn-outline" 
                onClick={() => handleDeleteUser(selectedUser.id)}
                style={{ 
                  width: '100%',
                  borderColor: '#dc2626',
                  color: '#dc2626'
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AdminDashboard;