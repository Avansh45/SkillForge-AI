// src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, saveUserSession, getDashboardPath } from '../utils/auth';

const Signup = ({ isOpen, onClose }) => {
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill all fields.');
      return;
    }

    const result = registerUser(role, name.trim(), email.trim(), password.trim());

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Save session and redirect
    saveUserSession(role, name.trim(), email.trim());
    const dashboardPath = getDashboardPath(role);
    navigate(dashboardPath);
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={handleClose}>×</span>
        <h3>Create your SkillForge account</h3>
        <p>Sign up as a student, instructor, or admin to start your learning journey.</p>

        <form onSubmit={handleSubmit}>
          <div className="role-row">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="signupName">Full Name*</label>
            <input
              type="text"
              id="signupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signupEmail">Email*</label>
            <input
              type="email"
              id="signupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signupPassword">Password*</label>
            <input
              type="password"
              id="signupPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-text" style={{ display: 'block' }}>{error}</div>}

          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Sign Up
            </button>
          </div>

          <p className="auth-hint">
            After account creation, you'll be taken to your role-specific dashboard.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;