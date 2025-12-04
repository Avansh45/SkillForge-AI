// src/pages/Home.jsx
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from './Login';
import Signup from './Signup';
import ContactSection from '../components/ContactSection';

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

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

      {/* Contact Section (component) */}
      <ContactSection onSubmit={handleContactSubmit} />

      <Footer />

      {/* Modals */}
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </>
  );
};

export default Home;