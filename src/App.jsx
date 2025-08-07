import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import PatientEdit from './components/PatientEdit';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#3498db',
    },
    error: {
      main: '#e74c3c',
    },
    background: {
      default: '#f5f6fa',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="app">
          <header className="header">
            <nav className="nav-container">
              <Link to="/" className="logo-link">
                <PetsIcon sx={{ fontSize: 24, color: 'black' }} />
                <h1>Loroncology</h1>
              </Link>
              <ul className="nav-links">
                <li><Link to="/">Ana Sayfa</Link></li>
                <li><Link to="/yeni-hasta">Yeni Hasta</Link></li>
                <li><Link to="/hastalar">Hastalar</Link></li>
              </ul>
            </nav>
          </header>
          <main className="main-content fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/yeni-hasta" element={<PatientForm />} />
              <Route path="/hastalar" element={<PatientList />} />
              <Route path="/hasta/:id" element={<PatientDetail />} />
              <Route path="/hasta-duzenle/:id" element={<PatientEdit />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
