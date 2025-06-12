import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import PatientEdit from './components/PatientEdit';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/yeni-hasta" element={<PatientForm />} />
          <Route path="/hastalar" element={<PatientList />} />
          <Route path="/hasta/:id" element={<PatientDetail />} />
          <Route path="/hasta-duzenle/:id" element={<PatientEdit />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
