import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import Loader from '../components/common/Loader';

export default function ProtectedRoute({ allowedRole, children }) {
  const { user, loading } = useAuth();
  const { getDashboardPath } = useRole();

  if (loading) {
    return <Loader message="Checking authentication..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch — redirect to correct dashboard
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}
