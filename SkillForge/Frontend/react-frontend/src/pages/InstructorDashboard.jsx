import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import { useInstructorCourses } from '../hooks';
import { createCourse, updateCourse, deleteCourse } from '../api/courseService';
import { getCourseVideos, addVideoLink, deleteVideo } from '../api/videoService';
import { getInstructorExams, getExamAttempts, deleteExam } from '../api/examService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Settings from './Settings';
import CreateExamModal from '../components/CreateExamModal';
import AddQuestionModal from '../components/AddQuestionModal';
import ManageQuestionsModal from '../components/ManageQuestionsModal';
import AIExamBuilder from '../components/AIExamBuilder';

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
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [selectedExamForAttempts, setSelectedExamForAttempts] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showManageQuestionsModal, setShowManageQuestionsModal] = useState(false);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const { courses, loading: loadingCourses, error: coursesError, refetch: refetchCourses } = useInstructorCourses();

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
      const examData = await getInstructorExams();
      setExams(Array.isArray(examData) ? examData : []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

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

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? This will also delete all questions and student attempts. This action cannot be undone.')) {
      return;
    }

    try {
      await deleteExam(examId);
      await fetchExams();
      alert('✅ Exam deleted successfully!');
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to delete exam. Please try again.'));
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

  const handleViewAttempts = async (exam) => {
    setSelectedExamForAttempts(exam);
    setLoadingAttempts(true);
    try {
      const attemptsData = await getExamAttempts(exam.id);
      setExamAttempts(Array.isArray(attemptsData) ? attemptsData : []);
    } catch (err) {
      console.error('Failed to fetch exam attempts:', err);
      alert('❌ ' + (err.message || 'Failed to load exam attempts.'));
      setExamAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleCloseAttempts = () => {
    setSelectedExamForAttempts(null);
    setExamAttempts([]);
  };

  const handleAddQuestion = (exam) => {
    setSelectedExamForQuestions(exam);
    setShowAddQuestionModal(true);
  };

  const handleManageQuestions = (exam) => {
    setSelectedExamForQuestions(exam);
    setShowManageQuestionsModal(true);
  };

  const handleQuestionAdded = () => {
    // Optionally refresh questions or show success message
    console.log('Question added successfully');
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
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px', marginTop: '1rem' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No batches assigned</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Contact admin to get batches assigned to you.</p>
                    </div>
                    <div className="stat-row">
                      <div className="stat-pill">
                        <strong>0</strong>
                        Active teaching batches
                      </div>
                      <div className="stat-pill">
                        <strong>0</strong>
                        Exams scheduled this week
                      </div>
                      <div className="stat-pill">
                        <strong>--</strong>
                        Avg student feedback
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Key Alerts</h3>
                    <p className="card-sub">Areas that might need your attention.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔔</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No alerts</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Alerts will appear when attention is needed.</p>
                    </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 className="section-block-title" style={{ margin: 0 }}>My Exams</h2>
                  <p className="section-block-sub" style={{ margin: '0.25rem 0 0 0' }}>
                    View and manage exams you've created for your courses.
                  </p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowCreateExamModal(true)}
                  style={{ height: 'fit-content' }}
                >
                  + Create Exam
                </button>
              </div>

              <div className="card">
                {loadingExams ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Loading exams...
                  </div>
                ) : exams && exams.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem' }}>Exam Title</th>
                          <th style={{ padding: '0.75rem' }}>Course</th>
                          <th style={{ padding: '0.75rem' }}>Start Time</th>
                          <th style={{ padding: '0.75rem' }}>End Time</th>
                          <th style={{ padding: '0.75rem' }}>Duration</th>
                          <th style={{ padding: '0.75rem' }}>Attempts</th>
                          <th style={{ padding: '0.75rem' }}>Questions</th>
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
                              {exam.course ? exam.course.title : 'No course'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.startTime ? new Date(exam.startTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Not set'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.endTime ? new Date(exam.endTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Not set'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.durationMinutes ? `${exam.durationMinutes} mins` : 'Not set'}
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
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                  onClick={() => handleAddQuestion(exam)}
                                >
                                  + Add Question
                                </button>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                  onClick={() => handleManageQuestions(exam)}
                                >
                                  📝 Manage
                                </button>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#dc2626', borderColor: '#dc2626' }}
                                  onClick={() => handleDeleteExam(exam.id)}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <button
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                onClick={() => handleViewAttempts(exam)}
                                disabled={!exam.attemptsCount || exam.attemptsCount === 0}
                              >
                                View Attempts
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
                    <p style={{ margin: 0, fontWeight: '500' }}>No exams created yet</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Create your first exam to get started.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Exam Builder Section */}
            <AIExamBuilder 
              exams={exams} 
              onQuestionsAdded={(examId) => {
                // Optionally refresh exam data or show success
                console.log('Questions added to exam:', examId);
                fetchExams(); // Refresh exam list
              }}
            />

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
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No batch data available</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Analytics will appear when students complete exams.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Learning Preferences</h3>
                    <p className="card-sub">How the system schedules and recommends practice.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚙️</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No preferences configured</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Set defaults in settings.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Students Needing Support</h3>
                    <p className="card-sub">Shortlist of students based on exam history.</p>
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                      <p style={{ margin: 0, fontWeight: '500' }}>No data available</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Student insights will appear after exams.</p>
                    </div>
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

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={showCreateExamModal}
        onClose={() => setShowCreateExamModal(false)}
        courses={courses}
        onSuccess={fetchExams}
      />

      {/* Exam Attempts Modal */}
      {selectedExamForAttempts && (
        <div className="modal-backdrop" onClick={handleCloseAttempts}>
          <div className="modal" style={{ maxWidth: '1000px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Exam Attempts</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
                  {selectedExamForAttempts.title} - {selectedExamForAttempts.course?.title}
                </p>
              </div>
              <button 
                className="btn btn-outline" 
                onClick={handleCloseAttempts}
                style={{ padding: '0.5rem 1rem' }}
              >
                Close
              </button>
            </div>

            {loadingAttempts ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                Loading attempts...
              </div>
            ) : examAttempts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                <p style={{ margin: 0, fontWeight: '500' }}>No attempts yet</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Students haven't taken this exam yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left', background: '#f8f9fa' }}>
                      <th style={{ padding: '0.75rem' }}>Student Name</th>
                      <th style={{ padding: '0.75rem' }}>Email</th>
                      <th style={{ padding: '0.75rem' }}>Score</th>
                      <th style={{ padding: '0.75rem' }}>Percentage</th>
                      <th style={{ padding: '0.75rem' }}>Correct</th>
                      <th style={{ padding: '0.75rem' }}>Wrong</th>
                      <th style={{ padding: '0.75rem' }}>Time Taken</th>
                      <th style={{ padding: '0.75rem' }}>Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examAttempts.map((attempt) => (
                      <tr key={attempt.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                          {attempt.student?.name || 'Unknown'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                          {attempt.student?.email || 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            fontWeight: '600',
                            color: attempt.score >= 70 ? '#16a34a' : attempt.score >= 50 ? '#f59e0b' : '#dc2626'
                          }}>
                            {attempt.score ? attempt.score.toFixed(1) : '0'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '60px',
                              height: '8px',
                              background: '#e0e0e0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${attempt.percentage || 0}%`,
                                height: '100%',
                                background: attempt.percentage >= 70 ? '#16a34a' : attempt.percentage >= 50 ? '#f59e0b' : '#dc2626',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {attempt.percentage ? attempt.percentage.toFixed(1) : '0'}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            color: '#16a34a', 
                            fontWeight: '500',
                            background: '#dcfce7',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                          }}>
                            {attempt.correctAnswers || 0}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            color: '#dc2626', 
                            fontWeight: '500',
                            background: '#fee2e2',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem'
                          }}>
                            {attempt.wrongAnswers || 0}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                          {attempt.timeTakenMinutes ? `${attempt.timeTakenMinutes} min` : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                          {attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Stats */}
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                      {examAttempts.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      Total Attempts
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {(examAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / examAttempts.length).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      Average Score
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                      {Math.max(...examAttempts.map(a => a.percentage || 0)).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      Highest Score
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                      {Math.min(...examAttempts.map(a => a.percentage || 0)).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      Lowest Score
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Management Modals */}
      <AddQuestionModal
        isOpen={showAddQuestionModal}
        onClose={() => setShowAddQuestionModal(false)}
        exam={selectedExamForQuestions}
        onSuccess={handleQuestionAdded}
      />

      <ManageQuestionsModal
        isOpen={showManageQuestionsModal}
        onClose={() => setShowManageQuestionsModal(false)}
        exam={selectedExamForQuestions}
      />

      <Footer />
    </>
  );
};

export default InstructorDashboard;