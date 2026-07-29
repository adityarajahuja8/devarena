import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonTable } from './ui/Skeleton';

const ProtectedRoute = ({ allowedRoles = [], requireApprovedStatus = false }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if trying to access unauthorized route
    const defaultDash = user.role === 'admin' ? '/admin/dashboard'
      : user.role === 'organizer' ? '/organizer/dashboard'
      : user.role === 'judge' ? '/judge/dashboard'
      : '/participant/dashboard';

    return <Navigate to={defaultDash} replace />;
  }

  if (requireApprovedStatus && (user.role === 'organizer' || user.role === 'judge') && user.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
