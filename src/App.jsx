import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ThemeProvider, createTheme, Button, useMediaQuery } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import PublicHome from './components/PublicHome';
import NotFound from './components/NotFound';
import LoadingScreen from './components/LoadingScreen';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import PatientEdit from './components/PatientEdit';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogCreate from './components/BlogCreate';
import AdminDashboard from './components/admin/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6',
    },
    secondary: {
      main: '#10B981',
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
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMobile = useMediaQuery('(max-width:768px)');

  const navLinkStyle = {
    color: '#FFFFFF',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '15px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
    }
  };

  return (
    <div className="app">
      <header 
        className="header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px',
          padding: '0 2rem'
        }}>
          <Link 
            to="/" 
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'transform 0.3s ease'
            }}
          >
            <PetsIcon sx={{ fontSize: 24, color: '#FFFFFF' }} />
            <h1 style={{ 
              color: '#FFFFFF',
              margin: 0,
              fontSize: '24px',
              fontWeight: 600
            }}>
              Loroncology
            </h1>
          </Link>
          
          <ul style={{
            display: isMobile ? 'none' : 'flex',
            gap: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            height: '100%',
            alignItems: 'center'
          }}>
            {user ? (
              <>
                <li>
                  <Link 
                    to="/" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/yeni-hasta" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Yeni Hasta
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/hastalar" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Kayıtlı Hastalar
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blog" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blog/yeni" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Yeni Blog Yazısı
                  </Link>
                </li>

                {user?.role === 'admin' && (
                  <li>
                    <Link 
                      to="/admin" 
                      style={{
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        fontSize: '15px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      Admin Paneli
                    </Link>
                  </li>
                )}
                <li>
                  <Button
                    onClick={logout}
                    sx={{ 
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      textTransform: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
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
                    to="/blog" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    style={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Giriş Yap
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    style={{
                      color: '#FFFFFF',
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  >
                    Kayıt Ol
              </Link>
                </li>
              </>
            )}
              </ul>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: isMobile ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '24px',
              padding: '8px',
              cursor: 'pointer'
            }}
          >
                {isMenuOpen ? '✕' : '☰'}
              </button>
          
              {isMenuOpen && (
            <div 
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998
              }}
            />
          )}
          
          <div style={{
            display: isMenuOpen ? 'block' : 'none',
            position: 'absolute',
            top: '70px',
            right: 0,
            background: 'white',
            width: '250px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
            opacity: isMenuOpen ? 1 : 0,
            transition: 'all 0.3s ease',
            zIndex: 999
          }}>
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: '16px'
            }}>
              {user ? (
                <>
                  <li>
                    <Link 
                      to="/" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/yeni-hasta" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Yeni Hasta
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/hastalar" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Kayıtlı Hastalar
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/blog" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/blog/yeni" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Yeni Blog Yazısı
                    </Link>
                  </li>

                  {user?.role === 'admin' && (
                    <li>
                      <Link 
                        to="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px 20px',
                          color: '#2c3e50',
                          textDecoration: 'none',
                          fontWeight: 500,
                          textAlign: 'left',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Admin Paneli
                      </Link>
                    </li>
                  )}
                  <li>
                    <Button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      sx={{ 
                        width: '100%',
                        padding: '12px 20px',
                        color: '#3B82F6',
                        justifyContent: 'center',
                        textAlign: 'left',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: '8px',
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
                      to="/blog" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: '#3B82F6',
                        background: 'rgba(59, 130, 246, 0.1)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'center',
                        borderRadius: '8px',
                        margin: '8px 0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        color: 'white',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        textAlign: 'center',
                        borderRadius: '8px',
                        margin: '8px 0',
                        transition: 'all 0.2s ease'
                      }}
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

      <main 
        className="main-content fade-in"
        style={{
          paddingTop: '70px',
          minHeight: 'calc(100vh - 70px)',
          width: '100%',
          position: 'relative',
          display: isAuthPage ? 'flex' : 'block',
          alignItems: isAuthPage ? 'center' : 'initial',
          justifyContent: isAuthPage ? 'center' : 'initial'
        }}
      >
            <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={user ? <ProtectedRoute><Home /></ProtectedRoute> : <PublicHome />} />
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

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
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
