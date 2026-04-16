// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const AdminRoute = ({ children }) => {
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const isAuthenticated = !!localStorage.getItem('accessToken');

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   const role = (user.role || user.Role)?.toLowerCase();
  
//   if (role !== 'admin') {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default AdminRoute;


import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';

const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const [hasAccess, setHasAccess] = useState(null); // null = loading

  useEffect(() => {
    if (!isAuthenticated) return;

    authAPI.getMyPermissions()
      .then(data => {
        const permissions = data.permissions || {};
        const allowed = Object.values(permissions).some(val => val === true);
        setHasAccess(allowed);
      })
      .catch(() => setHasAccess(false));
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hasAccess === null) return null; // loading, render nothing
  if (!hasAccess) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;