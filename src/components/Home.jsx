import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PetsIcon from '@mui/icons-material/Pets';
import { SvgIcon } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
      display: 'flex',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto',
      fontFamily: '"Inter", "Roboto", sans-serif',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        zIndex: 0
      }
    }}>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto 2.5rem auto',
              background: 'linear-gradient(45deg, #2196F3 30%, #00E5FF 90%)',
              boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
                },
                '50%': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 15px 45px rgba(33, 150, 243, 0.5)',
                },
                '100%': {
                  transform: 'scale(1)',
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
                },
              },
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 60, color: 'white' }} />
          </Avatar>
          
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{
              fontFamily: '"Poppins", "Montserrat", sans-serif',
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 4px 8px rgba(0,0,0,0.15)',
              fontSize: { xs: '2.75rem', md: '4rem' },
              letterSpacing: '0.02em',
              mb: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #00E5FF, #2196F3)',
                borderRadius: '2px'
              }
            }}
          >
            🐾 Loronkoloji
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{
              fontWeight: 500,
              color: 'rgba(255,255,255,0.95)',
              textShadow: '1px 2px 4px rgba(0,0,0,0.15)',
              fontSize: { xs: '1.3rem', md: '1.7rem' },
              mb: 6,
              maxWidth: '800px',
              margin: '0 auto',
              opacity: 0.9
            }}
          >
            Veteriner Onkoloji Hasta Takip Sistemi
          </Typography>
        </Box>

        {/* Main Action Cards */}
        <Grid 
          container 
          spacing={3} 
          justifyContent="center"
          alignItems="stretch"
          sx={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/yeni-hasta')}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                width: '100%',
                height: { xs: '280px', sm: '320px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  '& .snake-icon': {
                    transform: 'scale(1.1)',
                  }
                }
              }}
            >
              <SvgIcon 
                className="snake-icon"
                sx={{ 
                  fontSize: { xs: 120, sm: 160 },
                  mb: 2,
                  transition: 'transform 0.3s ease',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }}
                viewBox="0 0 100 100"
              >
                <path
                  d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30S66.5 20 50 20zm0 55c-13.8 0-25-11.2-25-25s11.2-25 25-25 25 11.2 25 25-11.2 25-25 25z"
                  fill="#10B981"
                />
                <path
                  d="M65 45c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5z"
                  fill="#1a1a1a"
                />
                <path
                  d="M45 45c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5z"
                  fill="#1a1a1a"
                />
                <path
                  d="M50 60c-8.4 0-15.3-6.9-15.3-15.3h5c0 5.7 4.6 10.3 10.3 10.3s10.3-4.6 10.3-10.3h5C65.3 53.1 58.4 60 50 60z"
                  fill="#1a1a1a"
                />
              </SvgIcon>
              <Typography 
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  mb: 1
                }}
              >
                Yeni Hasta Ekle
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Yeni hasta kaydı oluşturun
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/hastalar')}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                width: '100%',
                height: { xs: '280px', sm: '320px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  '& .cat-icon': {
                    transform: 'scale(1.1)',
                  }
                }
              }}
            >
              <SvgIcon 
                className="cat-icon"
                sx={{ 
                  fontSize: { xs: 120, sm: 160 },
                  mb: 2,
                  transition: 'transform 0.3s ease',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }}
                viewBox="0 0 100 100"
              >
                {/* Cat reading a book */}
                <path
                  d="M30 40 L70 40 L75 80 L25 80 Z"
                  fill="#3B82F6"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <path
                  d="M45 30 C45 20 55 20 55 30"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                />
                <circle cx="40" cy="35" r="3" fill="#1a1a1a" />
                <circle cx="60" cy="35" r="3" fill="#1a1a1a" />
                <path
                  d="M47 40 C50 42 53 42 55 40"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
                <path
                  d="M35 30 L25 25 M65 30 L75 25"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                />
                <rect
                  x="40"
                  y="45"
                  width="20"
                  height="25"
                  fill="#FFFFFF"
                  stroke="#1a1a1a"
                />
                <path
                  d="M45 50 L55 50 M45 55 L55 55 M45 60 L55 60"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
              </SvgIcon>
              <Typography 
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  mb: 1
                }}
              >
                Kayıtlı Hastalar
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Mevcut hasta kayıtlarını görüntüleyin
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Simple Footer */}
        <Box 
          sx={{ 
            py: 6, 
            textAlign: 'center',
            mt: 4,
            backgroundColor: 'rgba(249,250,251,0.1)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.95rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              fontFamily: '"Inter", "Roboto", sans-serif',
            }}
          >
            © 2025 Loronkoloji - Veteriner Onkoloji Hasta Takip Sistemi
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;