import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { tokens, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laden...</p>
      </div>
    );
  }

  if (!tokens?.accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnUrl: location.pathname, userType: 'client' }}
      />
    );
  }

  return <>{children}</>;
}