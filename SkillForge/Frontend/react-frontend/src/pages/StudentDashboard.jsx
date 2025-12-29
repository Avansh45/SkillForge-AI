import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import { useCourses, useStudentCourses } from '../hooks';
import { enrollInCourse, unenrollFromCourse } from '../api/studentService';
import { getCourseVideos } from '../api/videoService';
import { getStudentExams } from '../api/examService';
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
  }, []);

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