// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole, getUserSession } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role (if specified)
  if (requiredRole) {
    const user = getUserSession();
    
    if (!user || user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      // Redirect to home if role doesn't match
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;