import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import DoctorsList from './components/DoctorsList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import { ThemeProvider, createTheme } from '@mui/material';
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
import Inbox from './components/Inbox';
import EditProfile from './components/profile/EditProfile';
import Header from './components/Header';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1877f2', // Facebook blue
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
  return (
    <div className="app">
      <Header />
      
      <main 
        className="main-content fade-in"
        style={{
          minHeight: 'calc(100vh - 56px)',
          width: '100%',
          position: 'relative',
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
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

          <Route path="/inbox" element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute>
              <DoctorsList />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
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
