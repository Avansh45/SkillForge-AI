import React, { useState } from "react";
import { changePassword } from '../utils/auth';

const Settings = ({ user, role, handleLogout, onBackToDashboard }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    const res = await changePassword(user?.email, oldPassword, newPassword);
    setPwLoading(false);
    if (res.success) {
      setPwSuccess("Password changed successfully.");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      setPwError(res.error || "Failed to change password.");
    }
  };

  const passwordSection = (
    <div className="card" style={{ marginTop: 24 }}>
      <h3>Change Password</h3>
      <form onSubmit={handlePasswordChange} className="pw-form">
        <div className="pw-form-group">
          <label htmlFor="oldPassword">Old Password</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="pw-form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="pw-form-group">
          <label htmlFor="confirmPassword">Re-enter New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        {pwError && <div className="pw-error">{pwError}</div>}
        {pwSuccess && <div className="pw-success">{pwSuccess}</div>}
        <button className="btn btn-primary" type="submit" disabled={pwLoading} style={{marginTop:8}}>
          {pwLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
  const normalizedRole = (role || '').toLowerCase();
  let roleSpecificSettings = null;
  if (normalizedRole === "student") {
    roleSpecificSettings = (
      <div className="settings-content-full">
        <h2 className="section-block-title">Profile & Preferences</h2>
        <p className="section-block-sub">
          Configure how you want SkillForge to guide your learning.
        </p>
        <ul className="settings-list">
          <li><strong>Full name:</strong> <span>{user?.name || "-"}</span></li>
          <li><strong>Registered email:</strong> <span>{user?.email || "-"}</span></li>
          <li><strong>Role:</strong> <span>Student</span></li>
          <li><strong>Goal:</strong> <span>Campus placements</span></li>
        </ul>
        {passwordSection}
      </div>
    );
  } else if (normalizedRole === "admin") {
    roleSpecificSettings = (
      <>
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
                  <span className="label">{user?.name || "-"}</span>
                </li>
                <li>
                  <span>Registered email</span>
                  <span className="label">{user?.email || "-"}</span>
                </li>
                <li>
                  <span>Role</span>
                  <span className="label">Admin</span>
                </li>
              </ul>
              {/* Logout button removed from here, only sidebar logout remains */}
              {passwordSection}
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
      </>
    );
  } else if (normalizedRole === "instructor") {
    roleSpecificSettings = (
      <>
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
                  <span className="label">{user?.name || "-"}</span>
                </li>
                <li>
                  <span>Registered email</span>
                  <span className="label">{user?.email || "-"}</span>
                </li>
                <li>
                  <span>Role</span>
                  <span className="label">Instructor</span>
                </li>
              </ul>
              {/* Logout button removed from here, only sidebar logout remains */}
              {passwordSection}
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
      </>
    );
  }

  return (
    <div className="settings-fullpage-layout">
      <aside className="settings-sidebar">
        <div className="sidebar-header">
            <button className="back-btn-attractive" onClick={onBackToDashboard}>
              <span className="back-icon">&#8592;</span> Back to Dashboard
            </button>
        </div>
        {/* Logo removed as requested */}
        <div className="sidebar-user">
          <div className="user-avatar">
            <span role="img" aria-label="user">👤</span>
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || "-"}</div>
            <div className="user-role">{role ? role.charAt(0).toUpperCase() + role.slice(1) : "-"}</div>
          </div>
        </div>
          <div className="sidebar-actions sidebar-logout-only">
            <button className="back-btn-attractive logout-btn" onClick={handleLogout}>
              <span className="back-icon" style={{transform:'rotate(180deg)'}}>&#8592;</span> Logout
            </button>
          </div>
      </aside>
      <main className="settings-main-content">
        <div className="settings-content-wrapper settings-content-bg">
          <div className="settings-content-center">
            {roleSpecificSettings || (
              <div style={{color: 'red', padding: 24}}>
                <strong>Could not determine user role.</strong>
                <div>User: {JSON.stringify(user)}</div>
                <div>Role: {role}</div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style>{`
        .pw-form {
          margin-top: 12px;
        }
        .pw-form-group {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
        }
        .pw-form-group label {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .pw-form-group input {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 1rem;
        }
        .pw-error {
          color: #b91c1c;
          margin-bottom: 8px;
        }
        .pw-success {
          color: #059669;
          margin-bottom: 8px;
        }
        .settings-content-bg {
          background: var(--bg);
          box-shadow: none;
          border-radius: 0;
        }
        .settings-fullpage-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }
        .settings-sidebar {
          width: 270px;
          background: #fff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 0 0 0;
          box-shadow: 2px 0 8px 0 rgba(0,0,0,0.03);
          position: sticky;
          top: 0;
          height: 100vh;
          min-height: 100vh;
        }
        .sidebar-header {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          padding-left: 24px;
          margin-bottom: 32px;
        }
          .back-btn-attractive {
            background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
            border: none;
            color: #fff;
            font-size: 1.08rem;
            cursor: pointer;
            padding: 10px 28px 10px 18px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 2px 8px 0 rgba(34,197,94,0.08);
            transition: background 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .back-btn-attractive:hover {
            background: linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%);
            box-shadow: 0 4px 16px 0 rgba(34,197,94,0.15);
          }
          .back-icon {
            font-size: 1.2rem;
            margin-right: 4px;
          }
        .sidebar-logo {
          margin-bottom: 32px;
        }
        .sidebar-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }
        .user-avatar {
          width: 56px;
          height: 56px;
          background: #e0e7ef;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .user-info {
          text-align: center;
        }
        .user-name {
          font-weight: 600;
          font-size: 1.1rem;
        }
        .user-role {
          color: #6b7280;
          font-size: 0.95rem;
        }
        .sidebar-actions {
          margin-top: auto;
          margin-bottom: 32px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .sidebar-logout-only {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 12px;
        }
        @media (min-width: 900px) {
          .sidebar-logout-only {
            margin-top: 12px;
          }
        }
        .settings-main-content {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0;
          min-width: 0;
        }
        .settings-content-wrapper {
          width: 100%;
          max-width: 900px;
          background: transparent;
          border-radius: 0;
          box-shadow: none;
          padding: 48px 24px;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        }
        .settings-content-center {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .settings-list li, .list li {
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .settings-content-full > *,
        .settings-content-center > *,
        .settings-content-wrapper > * {
          margin-bottom: 18px;
        }
        @media (max-width: 1200px) {
          .settings-content-wrapper {
            max-width: 100vw;
            padding: 32px 8px;
          }
        }
        @media (max-width: 900px) {
          .settings-content-wrapper {
            padding: 24px 2vw;
          }
          .settings-sidebar {
            padding: 16px 0 0 0;
          }
          .settings-content-center {
            max-width: 100vw;
            padding: 0 8px;
          }
        }
        @media (max-width: 900px) {
          .settings-fullpage-layout {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: none;
            padding: 8px 0;
            min-height: unset;
            position: static;
            height: auto;
          }
          .sidebar-user {
            flex-direction: row;
            align-items: center;
            margin-bottom: 0;
            gap: 12px;
          }
          .user-avatar {
            margin-bottom: 0;
            margin-right: 8px;
          }
          .sidebar-actions {
            margin-bottom: 0;
            margin-top: 0;
          }
        }
        @media (max-width: 600px) {
          .settings-sidebar {
            flex-direction: column;
            align-items: stretch;
            padding: 8px 0;
          }
          .sidebar-user {
            flex-direction: column;
            align-items: center;
            gap: 0;
            margin-bottom: 0;
          }
          .user-avatar {
            margin-bottom: 8px;
            margin-right: 0;
          }
          .sidebar-actions {
            margin-bottom: 12px;
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
