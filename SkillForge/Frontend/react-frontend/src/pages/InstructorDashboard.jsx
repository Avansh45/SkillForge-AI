import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import { useInstructorCourses } from '../hooks';
import { createCourse, updateCourse, deleteCourse } from '../api/courseService';
import { getCourseVideos, addVideoLink, deleteVideo } from '../api/videoService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Settings from './Settings';

const InstructorDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoType: 'YOUTUBE', externalUrl: '' });
  const navigate = useNavigate();
  const headerRef = useRef(null);

  // Use custom hook for instructor courses
  const { courses, loading: loadingCourses, error: coursesError, refetch: refetchCourses } = useInstructorCourses();

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateCourse = () => {
    setCourseForm({ title: '', description: '' });
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setCourseForm({ title: course.title, description: course.description });
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleCancelForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    setCourseForm({ title: '', description: '' });
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      alert('⚠️ Course title is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseForm);
      } else {
        await createCourse(courseForm);
      }
      await refetchCourses();
      handleCancelForm();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to save course. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCourse(courseId);
      await refetchCourses();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to delete course. Please try again.'));
    }
  };

  const handleManageVideos = async (course) => {
    setSelectedCourse(course);
    setLoadingVideos(true);
    try {
      const videoData = await getCourseVideos(course.id);
      setVideos(Array.isArray(videoData) ? videoData : []);
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to load videos. Please try again.'));
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleAddVideo = () => {
    setVideoForm({ title: '', description: '', videoType: 'YOUTUBE', externalUrl: '' });
    setShowVideoForm(true);
  };

  const handleCancelVideoForm = () => {
    setShowVideoForm(false);
    setVideoForm({ title: '', description: '', videoType: 'YOUTUBE', externalUrl: '' });
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.externalUrl.trim()) {
      alert('⚠️ Title and video URL are required');
      return;
    }

    setSubmitting(true);
    try {
      await addVideoLink(selectedCourse.id, videoForm);
      await handleManageVideos(selectedCourse);
      handleCancelVideoForm();
      alert('✅ Video added successfully!');
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to add video. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await deleteVideo(selectedCourse.id, videoId);
      await handleManageVideos(selectedCourse);
      alert('✅ Video deleted successfully!');
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to delete video. Please try again.'));
    }
  };

  const handleCloseVideoManagement = () => {
    setSelectedCourse(null);
    setVideos([]);
    setShowVideoForm(false);
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
    { key: 'courses', label: 'Courses / Batches' },
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
              <strong>Instructor Dashboard</strong>
            </div>

            <div className="user-area">
              <span className="muted">{user?.name || 'Instructor'}</span>
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
          <section id="instructorSection">
            <div className="section-block" data-section="overview">
              <span className="pill">Instructor dashboard</span>
              <h1 className="section-block-title">Teaching overview</h1>
              <p className="section-block-sub">
                Check batch health, exam activity and students who might need more support.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h2>Batches You Manage</h2>
                    <p className="card-sub">Active batches linked to your account.</p>
                    <span className="tag">Active Batches</span>
                    <ul className="list">
                      <li>
                        <span>Java Placement 2025</span>
                        <span className="label">52 students</span>
                      </li>
                      <li>
                        <span>Aptitude Crash Course</span>
                        <span className="label">34 students</span>
                      </li>
                      <li>
                        <span>Verbal Skills Bootcamp</span>
                        <span className="label">28 students</span>
                      </li>
                    </ul>
                    <div className="stat-row">
                      <div className="stat-pill">
                        <strong>3</strong>
                        Active teaching batches
                      </div>
                      <div className="stat-pill">
                        <strong>6</strong>
                        Exams scheduled this week
                      </div>
                      <div className="stat-pill">
                        <strong>4.3★</strong>
                        Avg student feedback
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Key Alerts</h3>
                    <p className="card-sub">Areas that might need your attention.</p>
                    <ul className="list">
                      <li>
                        <span>Java Placement 2025</span>
                        <span className="label">12 students &lt; 50% accuracy</span>
                      </li>
                      <li>
                        <span>Aptitude Crash Course</span>
                        <span className="label">Participation drop this week</span>
                      </li>
                      <li>
                        <span>3 students</span>
                        <span className="label">Missed 2 consecutive exams</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-block" data-section="courses">
              <h2 className="section-block-title">Course & Content Management</h2>
              <p className="section-block-sub">
                Manage your real courses and batches from the backend.
              </p>
              
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Your Courses</h3>
                  <button className="btn btn-primary" onClick={handleCreateCourse}>
                    + Create Course
                  </button>
                </div>
                
                {showCourseForm && (
                  <div className="card" style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1.5rem' }}>
                    <h4>{editingCourse ? 'Edit Course' : 'Create New Course'}</h4>
                    <form onSubmit={handleSubmitCourse}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title *</label>
                        <input
                          type="text"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          placeholder="e.g., Java Spring Boot Fundamentals"
                          required
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                        <textarea
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          placeholder="Course description and objectives"
                          rows="4"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.6 : 1 }}>
                          {submitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={handleCancelForm} disabled={submitting}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {loadingCourses ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Loading your courses...
                  </div>
                ) : coursesError ? (
                  <div style={{ padding: '1.5rem', background: '#ffebee', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d32f2f', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                      <strong>Error Loading Courses</strong>
                    </div>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>{coursesError}</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>No courses yet</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Create your first course to get started!</p>
                  </div>
                ) : (
                  <ul className="list">
                    {courses.map((course) => (
                      <li key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>{course.title}</span>
                          {course.description && (
                            <span className="label" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', color: '#666' }}>
                              {course.description}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => handleManageVideos(course)}
                          >
                            Videos
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => handleEditCourse(course)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#d32f2f', borderColor: '#d32f2f' }}
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="section-block" data-section="exams">
              <h2 className="section-block-title">Exam Management</h2>
              <p className="section-block-sub">
                Create, schedule and track exams for your batches.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Recent Exams</h3>
                    <p className="card-sub">Latest exams created or completed.</p>
                    <ul className="list">
                      <li>
                        <span>Java OOP + Collections Mock</span>
                        <span className="label">Completed · Avg: 71%</span>
                      </li>
                      <li>
                        <span>Quant: Advanced Arithmetic</span>
                        <span className="label">Ongoing · 2 days left</span>
                      </li>
                      <li>
                        <span>Verbal: Email Etiquette</span>
                        <span className="label">Draft · Not published</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Quick Actions</h3>
                    <p className="card-sub">Common tasks you'll perform as an instructor.</p>
                    <ul className="list">
                      <li>
                        <span>Create new exam from blueprint</span>
                        <span className="label">Pick course, topic & difficulty</span>
                      </li>
                      <li>
                        <span>Import questions from CSV / Excel</span>
                        <span className="label">Update question bank</span>
                      </li>
                      <li>
                        <span>Publish exam to batch</span>
                        <span className="label">Set time, attempts & rules</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-block" data-section="analytics">
              <h2 className="section-block-title">Class Performance Analytics</h2>
              <p className="section-block-sub">
                High-level metrics to understand how your batches are performing.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Batch-level Insights</h3>
                    <p className="card-sub">Aggregated performance by batch.</p>
                    <ul className="list">
                      <li>
                        <span>Java Placement 2025</span>
                        <span className="label">Avg: 72% · Improving</span>
                      </li>
                      <li>
                        <span>Aptitude Crash Course</span>
                        <span className="label">Avg: 64% · Needs more practice</span>
                      </li>
                      <li>
                        <span>Verbal Bootcamp</span>
                        <span className="label">Avg: 78% · Stable</span>
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
                    <h3>Students Needing Support</h3>
                    <p className="card-sub">Shortlist of students based on exam history.</p>
                    <ul className="list">
                      <li>
                        <span>5 students</span>
                        <span className="label">&lt; 50% in last 3 exams</span>
                      </li>
                      <li>
                        <span>7 students</span>
                        <span className="label">Irregular participation</span>
                      </li>
                      <li>
                        <span>3 students</span>
                        <span className="label">Not attempted any mock</span>
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

      {/* Video Management Modal */}
      {selectedCourse && (
        <div className="modal-backdrop" onClick={handleCloseVideoManagement}>
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={handleCloseVideoManagement}>×</span>
            <h3>Manage Videos - {selectedCourse.title}</h3>
            <p>Add YouTube or external video links to your course</p>

            <div style={{ marginBottom: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleAddVideo}>
                + Add Video Link
              </button>
            </div>

            {showVideoForm && (
              <div className="card" style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1.5rem' }}>
                <h4>Add Video Link</h4>
                <form onSubmit={handleSubmitVideo}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Video Title *</label>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      placeholder="e.g., Introduction to Spring Boot"
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Video Type</label>
                    <select
                      value={videoForm.videoType}
                      onChange={(e) => setVideoForm({ ...videoForm, videoType: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="YOUTUBE">YouTube</option>
                      <option value="EXTERNAL">External Link</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Video URL *</label>
                    <input
                      type="url"
                      value={videoForm.externalUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, externalUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                    <textarea
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      placeholder="Brief description of the video content"
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Video'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={handleCancelVideoForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="card">
              <h4>Course Videos</h4>
              {loadingVideos ? (
                <div>Loading videos...</div>
              ) : videos.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No videos added yet. Add your first video link above.
                </div>
              ) : (
                <ul className="list">
                  {videos.map((video) => (
                    <li key={video.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '500' }}>{video.title}</span>
                        <span className="label" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', color: '#666' }}>
                          {video.videoType} {video.externalUrl && `• ${video.externalUrl.substring(0, 50)}...`}
                        </span>
                        {video.description && (
                          <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', color: '#999' }}>
                            {video.description}
                          </span>
                        )}
                      </div>
                      <div>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#d32f2f', borderColor: '#d32f2f' }}
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default InstructorDashboard;