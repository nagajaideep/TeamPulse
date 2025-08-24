import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Get role-based dashboard redirect
  const getDashboardRedirect = () => {
    if (!user) return "/login";
    return `/dashboard/${user.role}`;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={getDashboardRedirect()} /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to={getDashboardRedirect()} /> : <Register />} 
          />
          <Route 
            path="/dashboard/*" 
            element={isAuthenticated ? <RoleBasedDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? getDashboardRedirect() : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;