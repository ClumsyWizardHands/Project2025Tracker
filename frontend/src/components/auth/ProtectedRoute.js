import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * ProtectedRoute component that restricts access to authenticated users
 * @param {Object} props - Component props
 * @param {string|string[]} [props.requiredRole] - Required role(s) to access the route
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { currentUser, isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required but user doesn't have it, redirect to unauthorized
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has required role, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
