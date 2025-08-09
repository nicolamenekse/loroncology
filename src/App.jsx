import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ThemeProvider, createTheme, Button } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import PatientEdit from './components/PatientEdit';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogCreate from './components/BlogCreate';
import ChangePassword from './components/auth/ChangePassword';
import AdminDashboard from './components/admin/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const AppContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <nav className="nav-container">
          <Link to="/" className="logo-link">
            <PetsIcon sx={{ fontSize: 24, color: '#3B82F6' }} />
            <h1>Loroncology</h1>
          </Link>
          
                      <ul className="desktop-nav">
              <li><Link to="/blog">Blog</Link></li>
              {user ? (
                <>
                  <li><Link to="/">Ana Sayfa</Link></li>
                  <li><Link to="/hastalar">Kayıtlı Hastalar</Link></li>
                  <li><Link to="/yeni-hasta">Yeni Hasta</Link></li>
                  <li><Link to="/blog/yeni">Yeni Blog Yazısı</Link></li>
                  <li><Link to="/change-password">Şifre Değiştir</Link></li>
                  {user?.role === 'admin' && (
                    <li><Link to="/admin">Admin Paneli</Link></li>
                  )}
                  <li>
                    <Button
                      onClick={logout}
                      sx={{ 
                        color: '#3B82F6',
                        '&:hover': {
                          background: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                    >
                      Çıkış Yap
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="auth-button login">
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="auth-button register">
                      Kayıt Ol
                    </Link>
                  </li>
                </>
              )}
            </ul>

          <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
          
          {isMenuOpen && (
            <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
          )}
          
                      <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
              <ul className="nav-links">
                <li><Link to="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
                {user ? (
                  <>
                    <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Ana Sayfa</Link></li>
                    <li><Link to="/hastalar" onClick={() => setIsMenuOpen(false)}>Kayıtlı Hastalar</Link></li>
                    <li><Link to="/yeni-hasta" onClick={() => setIsMenuOpen(false)}>Yeni Hasta</Link></li>
                    <li><Link to="/blog/yeni" onClick={() => setIsMenuOpen(false)}>Yeni Blog Yazısı</Link></li>
                    <li><Link to="/change-password" onClick={() => setIsMenuOpen(false)}>Şifre Değiştir</Link></li>
                    {user?.role === 'admin' && (
                      <li><Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Paneli</Link></li>
                    )}
                    <li>
                      <Button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        sx={{ 
                          color: '#3B82F6',
                          width: '100%',
                          justifyContent: 'center',
                          '&:hover': {
                            background: 'rgba(59, 130, 246, 0.1)'
                          }
                        }}
                      >
                        Çıkış Yap
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link 
                        to="/login" 
                        className="auth-button login"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Giriş Yap
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/register" 
                        className="auth-button register"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Kayıt Ol
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
        </nav>
      </header>

      <main className="main-content fade-in">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/yeni-hasta" element={
            <ProtectedRoute>
              <PatientForm />
            </ProtectedRoute>
          } />
          <Route path="/hastalar" element={
            <ProtectedRoute>
              <PatientList />
            </ProtectedRoute>
          } />
          <Route path="/hasta/:id" element={
            <ProtectedRoute>
              <PatientDetail />
            </ProtectedRoute>
          } />
          <Route path="/hasta-duzenle/:id" element={
            <ProtectedRoute>
              <PatientEdit />
            </ProtectedRoute>
          } />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/yeni" element={
            <ProtectedRoute>
              <BlogCreate />
            </ProtectedRoute>
          } />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;