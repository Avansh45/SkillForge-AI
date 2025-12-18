// src/pages/Home.jsx
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from './Login';
import Signup from './Signup';
<<<<<<< HEAD
=======
import ContactSection from '../components/ContactSection';
>>>>>>> aacea16 (Merge TempBranch changes)

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

<<<<<<< HEAD
  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting SkillForge. We will get back to you soon.');
    e.target.reset();
=======
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

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
>>>>>>> aacea16 (Merge TempBranch changes)
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

            <div className="about-card">
              <h3>Adaptive Learning Snapshot</h3>
              <p>
                Imagine 2 learners attempting the same Java test. SkillForge's AI detects their strengths in real time, dynamically swapping questions and recommending micro-lessons for weak concepts. No two learning paths look exactly the same.
              </p>
              <div className="about-metric">
                <div>
                  <strong>40%</strong>
                  <span>Question reuse</span>
                </div>
                <div>
                  <strong>6 hrs/week</strong>
                  <span>Manual work saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <div className="container">
          <div className="section-heading">
<<<<<<< HEAD
            <h2>Features & Benefits</h2>
            <p>Everything you need to design, deliver, and analyse adaptive learning and exams on one platform.</p>
          </div>

          <div className="cards-grid">
            <div className="card">
              <h3>AI-driven Adaptive Engine</h3>
              <p>Tracks accuracy, time, and attempts to continuously rebalance question difficulty for each learner.</p>
              <span className="card-tag">Benefit: Right level of challenge</span>
            </div>
            <div className="card">
              <h3>Smart Exam Generator</h3>
              <p>Filter by course, topic, difficulty, and marks to auto-generate balanced exams in seconds.</p>
              <span className="card-tag">Benefit: Save hours of manual work</span>
            </div>
            <div className="card">
              <h3>Role-based Dashboards</h3>
              <p>Students view progress, instructors see class analytics, and admins monitor platform-wide performance.</p>
              <span className="card-tag">Benefit: Clarity for every stakeholder</span>
            </div>
            <div className="card">
              <h3>Performance Analytics</h3>
              <p>Visual reports on accuracy, topic-wise performance, difficulty vs. score, and improvement trends.</p>
              <span className="card-tag">Benefit: Data-backed decisions</span>
            </div>
            <div className="card">
              <h3>Question Bank Management</h3>
              <p>Create, tag, and organise questions with support for MCQ, coding, and subjective styles.</p>
              <span className="card-tag">Benefit: Reusable content library</span>
            </div>
            <div className="card">
              <h3>Exam Integrity & Settings</h3>
              <p>Control time limits, shuffling, negative marking, and attempt rules in a few clicks.</p>
              <span className="card-tag">Benefit: Flexible assessments</span>
=======
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
>>>>>>> aacea16 (Merge TempBranch changes)
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses">
        <div className="container">
          <div className="section-heading">
<<<<<<< HEAD
            <h2>Courses You Can Power with SkillForge</h2>
            <p>Use SkillForge for placement prep, semester subjects, internal tests, or skill-based micro-courses.</p>
=======
            <h2>Popular Course Tracks</h2>
            <p>Ready-made tracks to help students and teams ramp up faster.</p>
>>>>>>> aacea16 (Merge TempBranch changes)
          </div>

          <div className="course-grid">
            <div className="course-card">
<<<<<<< HEAD
              <span className="badge-small">Placement Prep</span>
              <h3>Java + DSA Foundations</h3>
              <p className="course-meta">Ideal for coding rounds, online assessments, and campus placements.</p>
              <p>Topic-wise adaptive quizzes, timed coding tasks, and auto-graded tests.</p>
              <div className="course-footer">
                <span>40+ modules</span>
                <span>Adaptive level · On</span>
              </div>
            </div>
            <div className="course-card">
              <span className="badge-small">Aptitude</span>
              <h3>Quant & Logical Reasoning</h3>
              <p className="course-meta">From basics to high-level puzzles.</p>
              <p>Step-wise hints, timed sections, and difficulty that scales with you.</p>
              <div className="course-footer">
                <span>30+ test sets</span>
                <span>AI analysis</span>
              </div>
            </div>
            <div className="course-card">
              <span className="badge-small">Communication</span>
              <h3>Verbal & English Practice</h3>
              <p className="course-meta">RC, grammar, vocabulary, and email writing tasks.</p>
              <p>Adaptive reading passages and vocabulary tests with spaced repetition.</p>
              <div className="course-footer">
                <span>20+ practice packs</span>
                <span>Skill tags</span>
              </div>
            </div>
            <div className="course-card">
              <span className="badge-small">Core CS</span>
              <h3>OS, DBMS & CN Objective Tests</h3>
              <p className="course-meta">College subject tests and quick revision.</p>
              <p>Topic-wise question banks with exam-style mocks.</p>
              <div className="course-footer">
                <span>Chapter-wise</span>
                <span>Exam mode</span>
              </div>
            </div>
            <div className="course-card">
              <span className="badge-small">Custom</span>
              <h3>Faculty-designed Courses</h3>
              <p className="course-meta">Create your own course and link question banks.</p>
              <p>Perfect for internal assessments and institute-specific exams.</p>
              <div className="course-footer">
                <span>Unlimited courses</span>
                <span>Instructor-led</span>
              </div>
            </div>
            <div className="course-card">
              <span className="badge-small">Practice Mode</span>
              <h3>Daily Mixed Practice</h3>
              <p className="course-meta">Short 15–20 minute sets.</p>
              <p>Daily adaptive practice to maintain consistency and track streaks.</p>
              <div className="course-footer">
                <span>Daily goals</span>
                <span>Streaks</span>
=======
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
>>>>>>> aacea16 (Merge TempBranch changes)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Section */}
<<<<<<< HEAD
      <section id="ai">
        <div className="container">
          <div className="section-heading">
            <h2>AI Engine & The Rising Hype</h2>
            <p>AI in education is growing rapidly — from content generation to adaptive assessments. SkillForge rides this wave responsibly.</p>
          </div>

          <div className="ai-content">
            <div>
              <p className="ai-highlight-text">
                In the last few years, AI-assisted tools have moved from "nice to have" to "must have". Institutions, training centres, and students now expect personalised experiences rather than one static exam for everyone.
              </p>

              <div className="ai-stats">
                <div className="ai-stat">
                  <strong>4x</strong>
                  Growth in AI tools adoption in education over recent years.
                </div>
                <div className="ai-stat">
                  <strong>65%</strong>
                  Students say personalised practice improves confidence.
                </div>
                <div className="ai-stat">
                  <strong>50%</strong>
                  Time saved by instructors when using AI question generation.
                </div>
              </div>

              <div className="ai-timeline">
                <div className="ai-timeline-item">
                  <span className="ai-timeline-dot"></span>
                  <span>Phase 1: Static question banks & manual paper setting.</span>
                </div>
                <div className="ai-timeline-item">
                  <span className="ai-timeline-dot"></span>
                  <span>Phase 2: Online exams with limited analytics.</span>
                </div>
                <div className="ai-timeline-item">
                  <span className="ai-timeline-dot"></span>
                  <span>Phase 3: AI-driven adaptive learning — where SkillForge fits in.</span>
                </div>
              </div>
            </div>

            <div className="ai-card">
              <h3>How SkillForge Uses AI</h3>
              <p className="card-sub">We don't use AI just for "hype". Our AI layer focuses on practicality and fairness:</p>
              <div className="ai-chip-row">
                <span className="ai-chip">Adaptive difficulty engine</span>
                <span className="ai-chip">Question recommendation</span>
                <span className="ai-chip">Performance clustering</span>
                <span className="ai-chip">Exam blueprint validation</span>
              </div>
              <ul className="list">
                <li>
                  <span className="about-bullet">✓</span>
                  Analyses performance patterns to recommend next best questions.
                </li>
                <li>
                  <span className="about-bullet">✓</span>
                  Ensures each exam remains balanced across topics & difficulty levels.
                </li>
                <li>
                  <span className="about-bullet">✓</span>
                  Prevents over-repetition of questions for serious learners.
                </li>
                <li>
                  <span className="about-bullet">✓</span>
                  Helps instructors identify which students need attention quickly.
                </li>
              </ul>
            </div>
          </div>

          <div className="cta">
            <div>
              <h3>Ready to build your adaptive learning space?</h3>
              <p>Start as a student, instructor, or admin — and connect dashboards as your ecosystem grows.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsSignupOpen(true)}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <div className="container">
          <div className="section-heading">
            <h2>Contact & Demo</h2>
            <p>Have questions or want to try SkillForge with your batch? Drop a message and we'll get in touch.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <p><strong>Email:</strong> contact@skillforge.ai (placeholder)</p>
              <p><strong>Use cases:</strong> College training, placement cell, coaching institutes, and internal assessments.</p>
              <p><strong>Note:</strong> Dashboards for students, instructors, and admins can be customised as per your institute's needs.</p>
            </div>

            <div className="contact-form">
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="contactName">Name*</label>
                  <input type="text" id="contactName" required />
                </div>
                <div className="form-group">
                  <label htmlFor="contactEmail">Email*</label>
                  <input type="email" id="contactEmail" required />
                </div>
                <div className="form-group">
                  <label htmlFor="contactRole">I am a</label>
                  <select id="contactRole">
                    <option>Student</option>
                    <option>Instructor</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="contactMessage">Message*</label>
                  <textarea id="contactMessage" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Send Message
                </button>
                <p className="muted" style={{ marginTop: '8px' }}>Our team will get back to you with more details.</p>
              </form>
=======
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
>>>>>>> aacea16 (Merge TempBranch changes)
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
=======
      {/* Contact Section (component) */}
      <ContactSection onSubmit={handleContactSubmit} />

>>>>>>> aacea16 (Merge TempBranch changes)
      <Footer />

      {/* Modals */}
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
};

export default Home;