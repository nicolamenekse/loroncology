import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Link } from 'react-router-dom';
import VerificationStatus from './VerificationStatus';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    mainSpecialty: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred during registration');
      }

      // Artık otomatik giriş yapmıyoruz, sadece doğrulama beklendiğini gösteriyoruz
      setRegistrationComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4, md: 8 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FFFFFF\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px',
          opacity: 0.1,
          animation: 'gradient-move 20s linear infinite',
        },
        '@keyframes gradient-move': {
          '0%': {
            backgroundPosition: '0 0',
          },
          '100%': {
            backgroundPosition: '60px 60px',
          },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={3} 
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)'
            }
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3,
              color: '#2c3e50',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Register
          </Typography>

          {registrationComplete ? (
            <VerificationStatus email={formData.email} />
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 1)'
                      }
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 1)'
                      }
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 1)'
                      }
                    }
                  }}
                />

                <FormControl 
                  fullWidth 
                  required
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 1)'
                      }
                    }
                  }}
                >
                  <InputLabel id="mainSpecialty-label">Uzmanlık Alanı</InputLabel>
                  <Select
                    labelId="mainSpecialty-label"
                    id="mainSpecialty"
                    name="mainSpecialty"
                    value={formData.mainSpecialty}
                    label="Uzmanlık Alanı"
                    onChange={handleChange}
                  >
                    <MenuItem value="Küçük Hayvan Hekimliği">Küçük Hayvan Hekimliği</MenuItem>
                    <MenuItem value="Büyük Hayvan Hekimliği">Büyük Hayvan Hekimliği</MenuItem>
                    <MenuItem value="Kanatlı Hayvan Hekimliği">Kanatlı Hayvan Hekimliği</MenuItem>
                    <MenuItem value="Egzotik Hayvan Hekimliği">Egzotik Hayvan Hekimliği</MenuItem>
                    <MenuItem value="Akademik / Araştırma">Akademik / Araştırma</MenuItem>
                    <MenuItem value="Saha & Üretim">Saha & Üretim</MenuItem>
                  </Select>
                  <FormHelperText>
                    Kayıt sonrası profilinizden alt uzmanlık alanlarınızı seçebilirsiniz
                  </FormHelperText>
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                    color: 'white',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <MuiLink component={Link} to="/login" sx={{ 
                      color: '#3B82F6',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}>
                      Login
                    </MuiLink>
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;