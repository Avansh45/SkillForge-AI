import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import { useCourses, useStudentCourses } from '../hooks';
import { enrollInCourse, unenrollFromCourse } from '../api/studentService';
import { getCourseVideos } from '../api/videoService';
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
  const navigate = useNavigate();
  const headerRef = useRef(null);

  // Use custom hooks for data fetching
  const { courses: allCourses, loading: loadingCourses } = useCourses();
  const { enrolledCourses, loading: loadingEnrollments, refetch: refetchEnrollments } = useStudentCourses();

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

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

  const getEmbedUrl = (url, videoType) => {
    if (!url) return null;
    
    if (videoType === 'YOUTUBE') {
      // Convert YouTube watch URL to embed URL
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
              <strong>Student Dashboard</strong>
            </div>

            <div className="user-area">
              <span className="muted">{user?.name || 'Student'}</span>
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
                    <h2>Learning Overview</h2>
                    <p className="card-sub">Quick view of your current courses and their progress.</p>
                    <span className="tag">Active Courses</span>
                    {loadingEnrollments ? (
                      <div style={{ padding: '1rem' }}>Loading your courses...</div>
                    ) : enrolledCourses.length === 0 ? (
                      <div style={{ padding: '1rem', color: '#666' }}>
                        No enrolled courses yet. Browse available courses below and enroll to get started!
                      </div>
                    ) : (
                      <ul className="list">
                        {enrolledCourses.slice(0, 5).map((enrollment) => (
                          <li key={enrollment.id}>
                            <span>{enrollment.course?.title || 'Unknown Course'}</span>
                            <span className="label">{enrollment.progressPercentage || 0}% complete</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="stat-row">
                      <div className="stat-pill">
                        <strong>{enrolledCourses.length}</strong>
                        Active courses
                      </div>
                      <div className="stat-pill">
                        <strong>{allCourses.length}</strong>
                        Available courses
                      </div>
                      <div className="stat-pill">
                        <strong>--</strong>
                        Overall progress
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Today's Focus</h3>
                    <p className="card-sub">Continue learning from your enrolled courses.</p>
                    {enrolledCourses.length === 0 ? (
                      <div style={{ padding: '1rem', color: '#666' }}>
                        Enroll in courses to see personalized recommendations here.
                      </div>
                    ) : (
                      <ul className="list">
                        {enrolledCourses.slice(0, 3).map((enrollment) => (
                          <li key={enrollment.id}>
                            <span>Continue: {enrollment.course?.title}</span>
                            <span className="label">Progress: {enrollment.progressPercentage || 0}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="chip-row">
                      <span className="chip">Adaptive practice</span>
                      <span className="chip">Weak topic focus</span>
                      <span className="chip">Time-bound tasks</span>
                    </div>
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
                      <ul className="list">
                        {enrolledCourses.map((enrollment) => (
                          <li key={enrollment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: '500' }}>{enrollment.course?.title || 'Unknown Course'}</span>
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
                                className="btn btn-outline" 
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#d32f2f', borderColor: '#d32f2f' }}
                                onClick={() => handleUnenroll(enrollment.course?.id)}
                              >
                                Unenroll
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
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
              <h2 className="section-block-title">Upcoming & Recent Exams</h2>
              <p className="section-block-sub">
                View upcoming exams and quickly revise recent attempts.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Upcoming Exams</h3>
                    <p className="card-sub">Make sure you're prepared.</p>
                    <ul className="list">
                      <li>
                        <span>Java OOPs & Collections</span>
                        <span className="label">Tomorrow · 30 MCQs · 45 mins</span>
                      </li>
                      <li>
                        <span>Quant: Number Systems</span>
                        <span className="label">In 3 days · 25 Qs · 40 mins</span>
                      </li>
                      <li>
                        <span>Verbal: Reading Comprehension</span>
                        <span className="label">In 5 days · 3 passages</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Recent Attempts</h3>
                    <p className="card-sub">Quick analytics from last few exams.</p>
                    <ul className="list">
                      <li>
                        <span>Java Basics Mock</span>
                        <span className="label">Score: 74% · Time: 38 mins</span>
                      </li>
                      <li>
                        <span>Quant Mixed Set</span>
                        <span className="label">Score: 68% · Retake suggested</span>
                      </li>
                      <li>
                        <span>Verbal RC Set #2</span>
                        <span className="label">Score: 82% · Good improvement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
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
                    <ul className="list">
                      <li>
                        <span>Problem solving (DSA)</span>
                        <span className="label">Strong · Accuracy 82%</span>
                      </li>
                      <li>
                        <span>Quantitative aptitude</span>
                        <span className="label">Moderate · Accuracy 64%</span>
                      </li>
                      <li>
                        <span>Verbal & communication</span>
                        <span className="label">Improving · Accuracy 72%</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Learning Preferences</h3>
                    <p className="card-sub">How the system schedules and recommends practice.</p>
                    <ul className="list">
                      <li>
                        <span>Daily practice time</span>
                        <span className="label">20–40 mins</span>
                      </li>
                      <li>
                        <span>Difficulty mode</span>
                        <span className="label">Adaptive · Medium → Hard</span>
                      </li>
                      <li>
                        <span>Reminder window</span>
                        <span className="label">Evening · 7 PM – 10 PM</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Recommendations</h3>
                    <p className="card-sub">Next actions generated from your recent history.</p>
                    <ul className="list">
                      <li>
                        <span>Revise Java Collections & Streams</span>
                        <span className="label">3 low-scoring attempts</span>
                      </li>
                      <li>
                        <span>Practice 10 Quant questions daily</span>
                        <span className="label">To reach 75%+ accuracy</span>
                      </li>
                      <li>
                        <span>Attempt one RC set every 2 days</span>
                        <span className="label">To stabilise reading speed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </section>
          </div>
        </main>
      </div>

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

      <Footer />
    </>
  );
};

export default StudentDashboard;