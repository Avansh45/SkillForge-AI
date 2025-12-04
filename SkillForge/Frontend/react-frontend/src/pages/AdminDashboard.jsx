// src/pages/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
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
              <strong>Admin Dashboard</strong><br />
              <span className="muted">Monitor usage, assessments and institute-wide activity</span>
            </div>

            <div className="user-area">
              <span className="muted">Admin</span>
              <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <Navbar
            items={navItems}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>
      </header>

      <main>
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
                    <div className="stat-row">
                      <div className="stat-pill">
                        <strong>420</strong>
                        Total users
                      </div>
                      <div className="stat-pill">
                        <strong>18</strong>
                        Active batches
                      </div>
                      <div className="stat-pill">
                        <strong>96</strong>
                        Exams conducted this month
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3>User Roles</h3>
                    <p className="card-sub">Breakdown of user types.</p>
                    <ul className="list">
                      <li>
                        <span>Students</span>
                        <span className="label">360</span>
                      </li>
                      <li>
                        <span>Instructors</span>
                        <span className="label">42</span>
                      </li>
                      <li>
                        <span>Admins</span>
                        <span className="label">18</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Activity Highlights</h3>
                    <p className="card-sub">Recent activity on the platform.</p>
                    <ul className="list">
                      <li>
                        <span>Average daily logins</span>
                        <span className="label">150</span>
                      </li>
                      <li>
                        <span>Peak usage time</span>
                        <span className="label">7 PM – 10 PM</span>
                      </li>
                      <li>
                        <span>Question bank size</span>
                        <span className="label">3,200 questions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Section */}
            <div className="section-block" data-section="courses">
              <h2 className="section-block-title">Courses & Batches Overview</h2>
              <p className="section-block-sub">
                Understand how learning content is distributed across your institute.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Course Catalog</h3>
                    <p className="card-sub">Active courses available to students.</p>
                    <ul className="list">
                      <li>
                        <span>Java + DSA Foundations</span>
                        <span className="label">Mapped to 4 batches</span>
                      </li>
                      <li>
                        <span>Quant & Logical Reasoning</span>
                        <span className="label">Mapped to 3 batches</span>
                      </li>
                      <li>
                        <span>Verbal & English Practice</span>
                        <span className="label">Mapped to 2 batches</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Batch Health Overview</h3>
                    <p className="card-sub">High-level performance indicators.</p>
                    <ul className="list">
                      <li>
                        <span>Average batch accuracy</span>
                        <span className="label">71%</span>
                      </li>
                      <li>
                        <span>Active vs inactive batches</span>
                        <span className="label">18 active · 3 inactive</span>
                      </li>
                      <li>
                        <span>Average exam participation</span>
                        <span className="label">82% of enrolled students</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Exams Section */}
            <div className="section-block" data-section="exams">
              <h2 className="section-block-title">Assessment Activity</h2>
              <p className="section-block-sub">
                Monitor exam volume and completion rates across the platform.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Exam Summary</h3>
                    <p className="card-sub">This month's assessment statistics.</p>
                    <ul className="list">
                      <li>
                        <span>Total exams conducted</span>
                        <span className="label">96</span>
                      </li>
                      <li>
                        <span>Average completion rate</span>
                        <span className="label">84%</span>
                      </li>
                      <li>
                        <span>Average score across exams</span>
                        <span className="label">69%</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Policy Overview</h3>
                    <p className="card-sub">Common exam policy patterns.</p>
                    <ul className="list">
                      <li>
                        <span>Use of negative marking</span>
                        <span className="label">Enabled in 72% of exams</span>
                      </li>
                      <li>
                        <span>Remote proctoring enabled</span>
                        <span className="label">For high-stakes tests</span>
                      </li>
                      <li>
                        <span>Result release mode</span>
                        <span className="label">Instant for 60% of exams</span>
                      </li>
                    </ul>
                  </div>
                </div>
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
                    <ul className="list">
                      <li>
                        <span>Active users this week</span>
                        <span className="label">312</span>
                      </li>
                      <li>
                        <span>Avg sessions per user</span>
                        <span className="label">3.1 per day</span>
                      </li>
                      <li>
                        <span>Top course by activity</span>
                        <span className="label">Java + DSA Foundations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Risk Indicators</h3>
                    <p className="card-sub">Signals where intervention may be needed.</p>
                    <ul className="list">
                      <li>
                        <span>Batches with low attendance</span>
                        <span className="label">3 batches below 60%</span>
                      </li>
                      <li>
                        <span>Students with no activity</span>
                        <span className="label">Last 14 days · 22 students</span>
                      </li>
                      <li>
                        <span>Courses with poor outcomes</span>
                        <span className="label">2 courses &lt; 60% avg score</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="section-block" data-section="settings">
              <h2 className="section-block-title">Admin Controls</h2>
              <p className="section-block-sub">
                Configure platform-wide defaults and manage access.
              </p>

              <div className="grid">
                <div>
                  <div className="card">
                    <h3>Account</h3>
                    <p className="card-sub">Details of your admin profile.</p>
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
                        <span className="label">Admin</span>
                      </li>
                    </ul>
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <h3>User & Role Management</h3>
                    <p className="card-sub">Control who can access what.</p>
                    <ul className="list">
                      <li>
                        <span>Pending instructor approvals</span>
                        <span className="label">3 requests</span>
                      </li>
                      <li>
                        <span>Role change requests</span>
                        <span className="label">2 awaiting review</span>
                      </li>
                      <li>
                        <span>Deactivated accounts</span>
                        <span className="label">5 accounts</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Platform Settings</h3>
                    <p className="card-sub">Key configuration options.</p>
                    <ul className="list">
                      <li>
                        <span>Default timezone</span>
                        <span className="label">Institute local time</span>
                      </li>
                      <li>
                        <span>Data export</span>
                        <span className="label">Monthly reports to admin email</span>
                      </li>
                      <li>
                        <span>Support contact</span>
                        <span className="label">support@skillforge.institute</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminDashboard;