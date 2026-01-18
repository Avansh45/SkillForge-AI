// src/pages/StudentDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const headerRef = useRef(null);

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

  const handleSectionChange = (targetKey) => {
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
                    <ul className="list">
                      <li>
                        <span>Java + DSA Foundations</span>
                        <span className="label">65% · 18/28 modules done</span>
                      </li>
                      <li>
                        <span>Quant & Logical Reasoning</span>
                        <span className="label">40% · Focus: Arithmetic</span>
                      </li>
                      <li>
                        <span>Verbal & English Practice</span>
                        <span className="label">55% · Reading speed improving</span>
                      </li>
                    </ul>
                    <div className="stat-row">
                      <div className="stat-pill">
                        <strong>3</strong>
                        Active courses
                      </div>
                      <div className="stat-pill">
                        <strong>5</strong>
                        Streak days this week
                      </div>
                      <div className="stat-pill">
                        <strong>78%</strong>
                        Overall accuracy
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Today's Focus</h3>
                    <p className="card-sub">AI picks the most useful tasks based on your recent performance.</p>
                    <ul className="list">
                      <li>
                        <span>Complete "Arrays & Collections" module</span>
                        <span className="label">Java · 25 mins</span>
                      </li>
                      <li>
                        <span>Attempt 15 Quant questions on ratios</span>
                        <span className="label">Accuracy &lt; 60%</span>
                      </li>
                      <li>
                        <span>1 Reading comprehension passage</span>
                        <span className="label">Improve speed</span>
                      </li>
                    </ul>
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
                Continue from where you left off or explore new learning tracks assigned to you.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>My Courses</h3>
                    <p className="card-sub">Courses currently assigned to your account.</p>
                    <ul className="list">
                      <li>
                        <span>Java + DSA Foundations</span>
                        <span className="label">Next: Trees & Graphs</span>
                      </li>
                      <li>
                        <span>Quant & Logical Reasoning</span>
                        <span className="label">Next: Number Systems</span>
                      </li>
                      <li>
                        <span>Verbal & English Practice</span>
                        <span className="label">Next: Error spotting</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Learning Path Summary</h3>
                    <p className="card-sub">Generated automatically based on your goals.</p>
                    <div className="stat-row">
                      <div className="stat-pill">
                        <strong>Placement</strong>
                        Goal: Product & Service companies
                      </div>
                      <div className="stat-pill">
                        <strong>60 days</strong>
                        Planned completion time
                      </div>
                      <div className="stat-pill">
                        <strong>On track</strong>
                        Current progress vs plan
                      </div>
                    </div>
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

            {/* Settings Section */}
            <div className="section-block" data-section="settings">
              <h2 className="section-block-title">Profile & Preferences</h2>
              <p className="section-block-sub">
                Configure how you want SkillForge to guide your learning.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Account</h3>
                    <p className="card-sub">Basic information linked to your profile.</p>
                    <ul className="list">
                      <li>
                        <span>Full name</span>
                        <span className="label">{user?.name || '-'}</span>
                      </li>
                      <li>
                        <span>Registered email</span>
                        <span className="label">{user?.email || '-'}</span>
                      </li>
                      <li>
                        <span>Role</span>
                        <span className="label">Student</span>
                      </li>
                      <li>
                        <span>Goal</span>
                        <span className="label">Campus placements</span>
                      </li>
                    </ul>
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
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
              </div>
            </div>
          </section>

          </div>
        </main>
      </div>


      <Footer />
    </>
  );
};

export default StudentDashboard;
