// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole, getUserSession } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === null) {
    return children;
  }

  if (requiredRole) {
    const user = getUserSession();
    if (!user || user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;