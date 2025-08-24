import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PermissionGuard = ({ 
  children, 
  requiredRole = null, 
  requiredPermissions = [], 
  fallback = null,
  allowedRoles = []
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return fallback;
  }

  // Check if user role is in allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => {
      switch (permission) {
        case 'create_tasks':
          return user.role === 'mentor' || user.role === 'coach';
        case 'assign_tasks':
          return user.role === 'mentor' || user.role === 'coach';
        case 'view_all_tasks':
          return user.role === 'coach';
        case 'view_reports':
          return user.role === 'mentor' || user.role === 'coach';
        case 'view_all_reports':
          return user.role === 'coach';
        case 'manage_users':
          return user.role === 'coach';
        default:
          return false;
      }
    });

    if (!hasPermission) {
      return fallback;
    }
  }

  return children;
};

export default PermissionGuard;