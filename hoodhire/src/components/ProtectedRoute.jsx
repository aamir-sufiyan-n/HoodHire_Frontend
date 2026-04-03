import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component - redirects to landing page if user is not authenticated
 * @param {Object} props - { children, role }
 */
const ProtectedRoute = ({ children, role }) => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = userStr ? JSON.parse(userStr) : null;

    // If no token or no user, redirect to landing page
    if (!token || !user) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return <Navigate to="/" replace />;
    }

    // If role is specified and doesn't match, redirect to landing page
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
