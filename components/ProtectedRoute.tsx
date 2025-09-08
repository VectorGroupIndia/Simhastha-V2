

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';
import { useLanguage } from '../contexts/LanguageContext';

interface ProtectedRouteProps {
  children: JSX.Element;
// FIX: Added 'user' to the list of allowed roles to fix a type error where `role="user"` was being used in App.tsx.
  role?: 'user' | 'admin' | 'authority' | 'volunteer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingIndicator message={t.authAuthenticating} />
        </div>
    );
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