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

  // Not logged in — redirect to the specific space's login if allowedRole is known
  if (!user) {
    const loginTarget = allowedRole ? `/login?role=${allowedRole}` : '/login';
    return <Navigate to={loginTarget} replace />;
  }

  // Role mismatch — redirect to correct dashboard
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}
