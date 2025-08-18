import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Token'ın geçerliliğini kontrol et
  const validateToken = async (token) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 
        (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return { valid: true, user: userData };
      } else {
        return { valid: false, user: null };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, user: null };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // LocalStorage'dan kullanıcı bilgilerini al
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        // Token'ın geçerliliğini kontrol et
        const { valid, user: validatedUser } = await validateToken(token);
        
        if (valid) {
          setUser(validatedUser || JSON.parse(storedUser));
        } else {
          // Token geçersiz, localStorage'ı temizle
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
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

  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const { valid, user: validatedUser } = await validateToken(token);
      if (valid && validatedUser) {
        setUser(validatedUser);
        localStorage.setItem('user', JSON.stringify(validatedUser));
        return true;
      }
    }
    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
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
