// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, saveUserSession, getDashboardPath } from '../utils/auth';

const Login = ({ isOpen, onClose }) => {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

<<<<<<< HEAD

  const handleSubmit = async (e) => {

=======
  const handleSubmit = async (e) => {
>>>>>>> TempBranch
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill all fields.');
      return;
    }

<<<<<<< HEAD

    const result = await loginUser(role, email.trim(), password.trim());

=======
    const result = await loginUser(email.trim(), password.trim(), role);
>>>>>>> TempBranch

    if (!result.success) {
      setError(result.error);
      return;
    }

<<<<<<< HEAD

    // Session is saved in loginUser function, just redirect

=======
    // Session is saved in loginUser function, just redirect
>>>>>>> TempBranch
    const dashboardPath = getDashboardPath(result.user.role);
    navigate(dashboardPath);
  };

  const handleClose = () => {
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
        <h3>Login to SkillForge</h3>
        <p>Choose your role and enter your credentials to continue.</p>

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
            <label htmlFor="loginEmail">Email*</label>
            <input
              type="email"
              id="loginEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword">Password*</label>
            <input
              type="password"
              id="loginPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-text" style={{ display: 'block' }}>{error}</div>}

          <div className="form-group">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Login
            </button>
          </div>

          <p className="auth-hint">
            After login, you'll be redirected to your role-based dashboard.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
