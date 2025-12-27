import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSession, logout } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Settings from './Settings';
import { getPlatformOverview, getAllUsers, updateUserRole, deleteUser } from '../api/adminService';
import { useCourses } from '../hooks';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const headerRef = useRef(null);
  
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const { courses, loading: loadingCourses } = useCourses();

  useEffect(() => {
    const currentUser = getUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingOverview(true);
      setLoadingUsers(true);
      
      console.log('Fetching admin data...');
      const [overviewData, usersData] = await Promise.all([
        getPlatformOverview(),
        getAllUsers()
      ]);
      
      console.log('Overview data:', overviewData);
      console.log('Users data:', usersData);
      
      setOverview(overviewData);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      console.error('Error details:', error.response || error.message);
      alert(`❌ Failed to load dashboard data: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoadingOverview(false);
      setLoadingUsers(false);
    }
  };

  const handleManageUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await updateUserRole(selectedUser.id, newRole);
      alert('✅ User role updated successfully!');
      handleCloseModal();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('❌ Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteUser(userId);
      alert('✅ User deleted successfully!');
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Failed to delete user. Please try again.');
    }
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
    { key: 'users', label: 'Users' },
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
              <strong>Admin Dashboard</strong>
            </div>

            <div className="user-area">
              <span className="muted">{user?.name || 'Admin'}</span>
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
                    {loadingOverview ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading statistics...
                      </div>
                    ) : (
                      <div className="stat-row">
                        <div className="stat-pill">
                          <strong>{overview?.totalUsers || 0}</strong>
                          Total users
                        </div>
                        <div className="stat-pill">
                          <strong>--</strong>
                          Active batches
                        </div>
                        <div className="stat-pill">
                          <strong>--</strong>
                          Exams conducted this month
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3>User Roles</h3>
                    <p className="card-sub">Breakdown of user types.</p>
                    {loadingOverview ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading user data...
                      </div>
                    ) : (
                      <ul className="list">
                        <li>
                          <span>Students</span>
                          <span className="label">{overview?.students || 0}</span>
                        </li>
                        <li>
                          <span>Instructors</span>
                          <span className="label">{overview?.instructors || 0}</span>
                        </li>
                        <li>
                          <span>Admins</span>
                          <span className="label">{overview?.admins || 0}</span>
                        </li>
                      </ul>
                    )}
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
                    {loadingCourses ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading courses...
                      </div>
                    ) : courses.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                        <p style={{ margin: 0 }}>No courses created yet</p>
                      </div>
                    ) : (
                      <ul className="list">
                        {courses.slice(0, 5).map((course) => (
                          <li key={course.id}>
                            <span>{course.title}</span>
                            <span className="label">
                              {course.instructor?.name || 'No instructor'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Total Courses: {courses.length}
                      </strong>
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        Showing {Math.min(5, courses.length)} of {courses.length} courses
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h3>Course Instructors</h3>
                    <p className="card-sub">Instructors and their courses.</p>
                    {loadingCourses ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading data...
                      </div>
                    ) : (
                      <ul className="list">
                        {courses
                          .filter(course => course.instructor?.name)
                          .reduce((acc, course) => {
                            const instructorName = course.instructor.name;
                            const existing = acc.find(item => item.name === instructorName);
                            if (existing) {
                              existing.count++;
                            } else {
                              acc.push({ name: instructorName, count: 1 });
                            }
                            return acc;
                          }, [])
                          .slice(0, 5)
                          .map((instructor, idx) => (
                            <li key={idx}>
                              <span>{instructor.name}</span>
                              <span className="label">{instructor.count} course{instructor.count !== 1 ? 's' : ''}</span>
                            </li>
                          ))
                        }
                        {courses.filter(c => !c.instructor?.name).length > 0 && (
                          <li>
                            <span>Unassigned</span>
                            <span className="label">
                              {courses.filter(c => !c.instructor?.name).length} course(s)
                            </span>
                          </li>
                        )}
                      </ul>
                    )}
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

            {/* User Management Section */}
            <div className="section-block" data-section="users">
              <h2 className="section-block-title">User Management</h2>
              <p className="section-block-sub">
                Manage all users on the platform - update roles and remove users.
              </p>
              
              <div className="card">
                {loadingUsers ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    Loading users...
                  </div>
                ) : users && users.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <p style={{ padding: '0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                      Showing {users.length} user(s)
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem' }}>Name</th>
                          <th style={{ padding: '0.75rem' }}>Email</th>
                          <th style={{ padding: '0.75rem' }}>Role</th>
                          <th style={{ padding: '0.75rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '0.75rem' }}>{u.name}</td>
                              <td style={{ padding: '0.75rem' }}>{u.email}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span className="pill" style={{ 
                                  background: u.role === 'ADMIN' ? '#3b82f6' : u.role === 'INSTRUCTOR' ? '#10b981' : '#6366f1',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <button 
                                  className="btn btn-outline" 
                                  style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                                  onClick={() => handleManageUser(u)}
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                    <p style={{ margin: 0, fontWeight: '500' }}>No users found</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Check console for errors or verify backend is running.</p>
                  </div>
                )}
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

          </section>
          </div>
        </main>
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={handleCloseModal}>×</span>
            <h3>Manage User</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Update role or remove user from the platform</p>

            <div className="card" style={{ padding: '1rem', background: '#f8f9fa', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Name:</strong> {selectedUser.name}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div>
                <strong>Current Role:</strong> 
                <span className="pill" style={{ 
                  marginLeft: '0.5rem',
                  background: selectedUser.role === 'ADMIN' ? '#3b82f6' : selectedUser.role === 'INSTRUCTOR' ? '#10b981' : '#6366f1',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="newRole">New Role</label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateRole}
                style={{ flex: 1 }}
              >
                Update Role
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleCloseModal}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                ⚠️ Danger Zone
              </p>
              <button 
                className="btn btn-outline" 
                onClick={() => handleDeleteUser(selectedUser.id)}
                style={{ 
                  width: '100%',
                  borderColor: '#dc2626',
                  color: '#dc2626'
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AdminDashboard;