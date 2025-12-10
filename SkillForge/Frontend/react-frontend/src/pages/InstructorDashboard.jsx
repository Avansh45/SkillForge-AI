// src/pages/InstructorDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InstructorDashboard = () => {
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
              <strong>Instructor Dashboard</strong><br />
              <span className="muted">Manage batches, exams and student performance</span>
            </div>

            <div className="user-area">
              <span className="muted">Instructor</span>
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
            {/* Overview Section */}
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

            {/* Courses Section */}
            <div className="section-block" data-section="courses">
              <h2 className="section-block-title">Course & Content Management</h2>
              <p className="section-block-sub">
                Organise your question banks and map them to courses and batches.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Question Banks</h3>
                    <p className="card-sub">Reusable content organised by topic and difficulty.</p>
                    <ul className="list">
                      <li>
                        <span>Java – OOP & Collections</span>
                        <span className="label">180 questions · Easy/Med/Hard</span>
                      </li>
                      <li>
                        <span>Quant – Arithmetic</span>
                        <span className="label">140 questions · 6 sub-topics</span>
                      </li>
                      <li>
                        <span>Verbal – RC & Grammar</span>
                        <span className="label">110 questions · 12 passages</span>
                      </li>
                    </ul>
                    <div className="chip-row">
                      <span className="chip">MCQ</span>
                      <span className="chip">Coding</span>
                      <span className="chip">Subjective</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Batch Mapping</h3>
                    <p className="card-sub">Which banks are connected to which batches.</p>
                    <ul className="list">
                      <li>
                        <span>Java Placement 2025</span>
                        <span className="label">Java + Aptitude banks</span>
                      </li>
                      <li>
                        <span>Aptitude Crash Course</span>
                        <span className="label">Quant + Reasoning banks</span>
                      </li>
                      <li>
                        <span>Verbal Bootcamp</span>
                        <span className="label">RC + Email writing banks</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Exams Section */}
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

            {/* Analytics Section */}
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

            {/* Settings Section */}
            <div className="section-block" data-section="settings">
              <h2 className="section-block-title">Instructor Settings</h2>
              <p className="section-block-sub">
                Configure defaults for your exams and communication.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Account</h3>
                    <p className="card-sub">Basic information linked to your instructor profile.</p>
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
                        <span className="label">Instructor</span>
                      </li>
                    </ul>
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <h3>Exam Defaults</h3>
                    <p className="card-sub">Standard settings applied to new exams.</p>
                    <ul className="list">
                      <li>
                        <span>Negative marking</span>
                        <span className="label">-0.25 for wrong answers</span>
                      </li>
                      <li>
                        <span>Question shuffle</span>
                        <span className="label">Enabled for all exams</span>
                      </li>
                      <li>
                        <span>Result visibility</span>
                        <span className="label">Instant with solution view</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Communication & Notifications</h3>
                    <p className="card-sub">How students receive updates.</p>
                    <ul className="list">
                      <li>
                        <span>Exam alerts</span>
                        <span className="label">Email + in-app notification</span>
                      </li>
                      <li>
                        <span>Reminder schedule</span>
                        <span className="label">24 hrs & 2 hrs before exam</span>
                      </li>
                      <li>
                        <span>Feedback forms</span>
                        <span className="label">After every major exam</span>
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

export default InstructorDashboard;