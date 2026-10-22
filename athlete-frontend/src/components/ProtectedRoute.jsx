import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Role-Based Access Control (RBAC) Route Guard
 * - Verifies user authentication.
 * - Validates role authorization against allowedRoles.
 * - Redirects unauthorized roles to their respective role dashboard.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the user's role-authorized home
    if (role === 'ATHLETE') {
      return <Navigate to="/athlete" replace />;
    }
    if (role === 'PROFESSIONAL') {
      return <Navigate to="/professional" replace />;
    }
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
