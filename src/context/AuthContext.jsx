import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // LocalStorage'dan kullanıcı bilgilerini al
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    token: localStorage.getItem('token')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route bileşeni
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Kullanıcı giriş yapmamışsa, mevcut URL'yi state olarak login sayfasına gönder
      navigate('/login', { state: { from: location } });
    } else if (!loading && user && adminOnly && user.role !== 'admin') {
      // Admin-only route için yetkisiz erişim
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate, location, adminOnly]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    return null;
  }

  return children;
};
