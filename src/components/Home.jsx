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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
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
              width: 100,
              height: 100,
              margin: '0 auto 2rem auto',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 50, color: 'white' }} />
          </Avatar>
          
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 800,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '0.02em',
              mb: 2
            }}
          >
            🐾 Loronkoloji
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              mb: 4
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
            <Card
              sx={{
                height: { xs: '280px', sm: '320px' },
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  '& .action-icon': {
                    transform: 'scale(1.1)',
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
                }
              }}
              onClick={() => navigate('/yeni-hasta')}
            >
              <CardContent 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <AddCircleOutlineIcon 
                  className="action-icon"
                  sx={{ 
                    fontSize: { xs: 60, sm: 70 }, 
                    color: 'success.main', 
                    mb: 2,
                    transition: 'all 0.3s ease',
                    filter: 'drop-shadow(0 4px 8px rgba(76,175,80,0.3))'
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'success.main', 
                    mb: 2,
                    fontSize: { xs: '1.3rem', sm: '1.5rem' }
                  }}
                >
                  Yeni Hasta Ekle
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' }, 
                    lineHeight: 1.5, 
                    mb: 3,
                    textAlign: 'center'
                  }}
                >
                  Yeni onkoloji hastası kaydı oluşturun
                </Typography>
                <Button 
                  variant="contained" 
                  color="success"
                  sx={{ 
                    px: 3, 
                    py: 1.2,
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(76,175,80,0.4)',
                    }
                  }}
                >
                  Hasta Ekle
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: { xs: '280px', sm: '320px' },
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  '& .action-icon': {
                    transform: 'scale(1.1)',
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #2196F3, #9C27B0)',
                }
              }}
              onClick={() => navigate('/hastalar')}
            >
              <CardContent 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <ListAltIcon 
                  className="action-icon"
                  sx={{ 
                    fontSize: { xs: 60, sm: 70 }, 
                    color: 'primary.main', 
                    mb: 2,
                    transition: 'all 0.3s ease',
                    filter: 'drop-shadow(0 4px 8px rgba(33,150,243,0.3))'
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main', 
                    mb: 2,
                    fontSize: { xs: '1.3rem', sm: '1.5rem' }
                  }}
                >
                  Kayıtlı Hastalar
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' }, 
                    lineHeight: 1.5, 
                    mb: 3,
                    textAlign: 'center'
                  }}
                >
                  Mevcut hasta kayıtlarını görüntüleyin
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    px: 3, 
                    py: 1.2,
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(33,150,243,0.4)',
                    }
                  }}
                >
                  Hastaları Görüntüle
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Simple Footer */}
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem'
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