
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  role?: 'admin' | 'authority' | 'volunteer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  
  if (role && user.role !== role) {
    // If a specific role is required and user doesn't have it,
    // redirect to home or a dedicated "unauthorized" page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;