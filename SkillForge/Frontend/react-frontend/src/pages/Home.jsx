import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from './Login';
import Signup from './Signup';
import ContactSection from '../components/ContactSection';
import { useCourses } from '../hooks';
import { enrollInCourse } from '../api/studentService';
import { getUserSession } from '../utils/auth';

import ContactSection from '../components/ContactSection';


const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [enrolling, setEnrolling] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Use custom hook for courses
  const { courses, loading: loadingCourses, error: coursesError } = useCourses();

<<<<<<< HEAD

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
=======
  // Fetch user session on mount
  useEffect(() => {
    const currentUser = getUserSession();
    setUser(currentUser);
  }, []);

  const handleCourseClick = (course) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    // If user is student, stay on page to enroll
    // If instructor/admin, could navigate to dashboard
    if (user.role !== 'STUDENT') {
      navigate(`/${user.role.toLowerCase()}`);
    }
  };

  const handleEnroll = async (courseId, e) => {
    e.stopPropagation();
    
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (user.role !== 'STUDENT') {
      alert('⚠️ Only students can enroll in courses');
      return;
    }

    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      alert('✅ Successfully enrolled in course! Check your Student Dashboard.');
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to enroll. You may already be enrolled.'));
    } finally {
      setEnrolling(null);
    }
  };
>>>>>>> TempBranch

  const handleContactSubmit = async (data) => {
    setFormError('');
    setFormSuccess('');

    
    if (!data?.name || !data?.email || !data?.message) {
      setFormError('Please fill in all required fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }

    const message = {
      id: `msg_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role || 'Student',
      message: data.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    try {
      
      const inboxKey = 'skillforge_contact_inbox';
      const existing = JSON.parse(localStorage.getItem(inboxKey) || '[]');
      existing.unshift(message); // newest first
      localStorage.setItem(inboxKey, JSON.stringify(existing));

      setFormSuccess('Thanks — your message has been received. We will contact you soon.');
      return true;
    } catch (err) {
      console.error('Saving contact message failed', err);
      setFormError('Something went wrong while sending your message. Please try again.');
      return false;
    }
<<<<<<< HEAD

=======
>>>>>>> TempBranch
  };

  return (
    <>
      <Header
        onLoginClick={() => setIsLoginOpen(true)}
        onSignupClick={() => setIsSignupOpen(true)}
      />

      {/* Hero Section */}
      <section id="home">
        <div className="container">
          <div className="hero">
            <div className="hero-left">
              <div className="badge">
                <span className="badge-dot"></span>
                Live · AI-powered adaptive exams
              </div>
              <h1>
                <span className="highlight">Personalised learning</span> & smart exams for every learner.
              </h1>
              <p className="hero-subtitle">
                SkillForge uses an AI-driven engine to analyse performance in real time, adapt difficulty, and auto-generate exams so that students, instructors, and admins stay in sync on one platform.
              </p>
              <div className="hero-cta">
                <button className="btn btn-primary" onClick={() => setIsSignupOpen(true)}>
                  Get Started Free
                </button>
                <button className="btn btn-outline" onClick={() => {
                  document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Explore Courses
                </button>
              </div>
              <div className="hero-meta">
                <div><strong>3x</strong> Faster exam creation</div>
                <div><strong>24/7</strong> Adaptive practice</div>
                <div><strong>Role-based</strong> Student · Instructor · Admin</div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-right-floating">
                AI Confidence Score: <span>92%</span>
              </div>
              <div className="hero-grid">
                <div className="mini-card">
                  <div className="mini-card-title">Adaptive Difficulty</div>
                  <p>Question levels automatically adjust after each attempt based on performance trends.</p>
                  <span className="mini-chip">
                    <span className="tiny-dot"></span>
                    Live adjustment
                  </span>
                </div>
                <div className="mini-card">
                  <div className="mini-card-title">Exam Generator</div>
                  <p>Generate balanced mock tests using tags like topic, level, and learning outcomes.</p>
                  <span className="mini-chip">150+ question pools</span>
                </div>
                <div className="mini-card">
                  <div className="mini-card-title">Real-time Analytics</div>
                  <p>Track accuracy, speed, and weak areas in one dashboard.</p>
                  <div className="progress-bar">
                    <div className="progress-bar-fill"></div>
                  </div>
                </div>
                <div className="mini-card">
                  <div className="mini-card-title">Role-based Access</div>
                  <p>Separate views for Students, Instructors, and Admins.</p>
                  <span className="mini-chip">1-click dashboard switch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <div className="container">
          <div className="section-heading">
            <h2>About SkillForge</h2>
            <p>SkillForge is built to support modern learners, instructors, and admins with AI that adapts to each learner's journey.</p>
          </div>

          <div className="content">
            <div className="about-text">
              <span className="pill">Why we exist</span>
              <h3>From fixed question sets to intelligent learning paths.</h3>
              <p>
                Traditional exams are static and time-consuming to design. SkillForge automates exam generation and delivers personalised practice so that students can learn at the right pace and instructors can focus on teaching, not paperwork.
              </p>
              <ul className="about-list">
                <li>
                  <span className="about-bullet">✓</span>
                  AI evaluates performance and adjusts difficulty in real-time.
                </li>
                <li>
                  <span className="about-bullet">✓</span>
                  Question banks organised by topics, skills, and cognitive levels.
                </li>
                <li>
                  <span className="about-bullet">✓</span>
                  Dashboards tailored for Students, Instructors, and Admins.
                </li>
                <li>
                  <span className="about-bullet">✓</span>
                  Designed to support college training, test prep, and internal assessments.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <div className="container">
          <div className="section-heading">
<<<<<<< HEAD

=======
>>>>>>> TempBranch
            <h2>Platform Features</h2>
            <p>Everything you need to run adaptive learning and assessments in one place.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="pill">Assessment</div>
              <h3>AI Exam Builder</h3>
              <p>Create balanced exams with tags for topics, difficulty, and outcomes. Auto-generate variants in seconds.</p>
              <ul>
                <li>Blueprint-based generation</li>
                <li>Time limits and retake rules</li>
                <li>Instant scoring</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="pill">Analytics</div>
              <h3>Skill Radar</h3>
              <p>Live dashboards for accuracy, speed, and concept mastery across cohorts or individual learners.</p>
              <ul>
                <li>Weak-area detection</li>
                <li>Progress over time</li>
                <li>Exportable reports</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="pill">Collaboration</div>
              <h3>Instructor Workspace</h3>
              <p>Manage batches, assign practice, review attempts, and leave inline feedback on questions.</p>
              <ul>
                <li>Batch-level insights</li>
                <li>Assignment scheduling</li>
                <li>Role-based access</li>
              </ul>
<<<<<<< HEAD

=======
>>>>>>> TempBranch
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses">
        <div className="container">
          <div className="section-heading">
<<<<<<< HEAD

            <h2>Popular Course Tracks</h2>
            <p>Ready-made tracks to help students and teams ramp up faster.</p>

          </div>

          <div className="course-grid">
            <div className="course-card">

              <span className="pill">Development</span>
              <h3>Full-Stack Java</h3>
              <p>Spring Boot, REST, JPA, testing, and CI/CD fundamentals with adaptive practice exams.</p>
              <div className="course-meta">
                <span>12 modules</span>
                <span>Projects + exams</span>
              </div>
            </div>

            <div className="course-card">
              <span className="pill">Data</span>
              <h3>Data Structures & Algorithms</h3>
              <p>Adaptive question sets on arrays, trees, graphs, DP, and complexity analysis.</p>
              <div className="course-meta">
                <span>150+ questions</span>
                <span>Timed mocks</span>
              </div>
            </div>

            <div className="course-card">
              <span className="pill">Cloud</span>
              <h3>DevOps Foundations</h3>
              <p>CI/CD pipelines, Docker, Kubernetes basics, and reliability drills with scenario-based quizzes.</p>
              <div className="course-meta">
                <span>8 labs</span>
                <span>Checkpoints</span>

              </div>
            </div>
          </div>
=======
            <h2>Popular Course Tracks</h2>
            <p>Ready-made tracks to help students and teams ramp up faster.</p>
          </div>

          {loadingCourses ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
              <p style={{ fontSize: '1.125rem', margin: 0 }}>Loading courses...</p>
            </div>
          ) : coursesError ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: '#ffebee', borderRadius: '12px', border: '1px solid #ffcdd2' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ color: '#d32f2f', fontWeight: '500', marginBottom: '0.5rem' }}>Failed to load courses</p>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>{coursesError}</p>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <p style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>No courses available yet</p>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>Check back soon for new courses!</p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="course-card"
                  onClick={() => handleCourseClick(course)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span className="pill">Course</span>
                  <h3>{course.title}</h3>
                  <p>{course.description || 'Comprehensive course content designed for effective learning.'}</p>
                  <div className="course-meta">
                    {course.instructor?.name && (
                      <span>👨‍🏫 {course.instructor.name}</span>
                    )}
                    <span>ID: {course.id}</span>
                  </div>
                  {user?.role === 'STUDENT' && (
                    <button
                      className="btn btn-primary"
                      onClick={(e) => handleEnroll(course.id, e)}
                      disabled={enrolling === course.id}
                      style={{
                        width: '100%',
                        marginTop: '1rem',
                        opacity: enrolling === course.id ? 0.6 : 1,
                        cursor: enrolling === course.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                  {!user && (
                    <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#ecfdf3', borderRadius: '6px', fontSize: '0.875rem', color: '#16a34a' }}>
                      👉 Login to enroll
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
>>>>>>> TempBranch
        </div>
      </section>

      {/* AI Engine Section */}
<<<<<<< HEAD

=======
>>>>>>> TempBranch
      <section id="ai" className="ai-section">
        <div className="container">
          <div className="section-heading">
            <h2>AI Engine</h2>
            <p>How SkillForge adapts to every learner.</p>
          </div>

          <div className="ai-grid">
            <div className="ai-card">
              <h3>Dynamic Difficulty</h3>
              <p>Adjusts question difficulty after each attempt using rolling accuracy and time-to-answer.</p>
            </div>
            <div className="ai-card">
              <h3>Recommendation Graph</h3>
              <p>Maps skills to prerequisites to suggest the next best module or micro-lesson.</p>
            </div>
            <div className="ai-card">
              <h3>Generative Exams</h3>
              <p>Builds balanced mocks from tagged banks; prevents overlap and keeps variants fresh.</p>
            </div>
            <div className="ai-card">
              <h3>Feedback Loops</h3>
              <p>Captures question-level feedback to improve future recommendations and item quality.</p>
<<<<<<< HEAD

=======
>>>>>>> TempBranch
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD

      {/* Contact Section (component) */}
      <ContactSection onSubmit={handleContactSubmit} />


=======
      {/* Contact Section (component) */}
      <ContactSection onSubmit={handleContactSubmit} />

>>>>>>> TempBranch
      <Footer />

      {/* Modals */}
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
};

export default Home;
