
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * A wrapper component for routes that require authentication
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

/**
 * A wrapper component for routes that should only be accessible to non-authenticated users
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
}) => {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    // Redirect to home page
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default { ProtectedRoute, PublicOnlyRoute };
