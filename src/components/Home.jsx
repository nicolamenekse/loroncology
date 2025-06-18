import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 700,
          color: 'primary.main',
          letterSpacing: 1.5
        }}>
          Loronkoloji Hasta Takip Sistemi
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          color: 'text.secondary',
          letterSpacing: 1.2
        }}>
          Kanserli hasta takibi için güvenilir ve kullanıcı dostu sistem
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, background-color 0.3s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'scale(1.05)',
                boxShadow: 6
              },
            }}
            onClick={() => navigate('/yeni-hasta')}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, transition: 'color 0.3s ease', '&:hover': { color: 'secondary.main' } }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              color: 'text.primary'
            }}>
              Yeni Hasta Kaydı
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 300
            }}>
              Yeni bir hasta kaydı oluşturmak için tıklayın
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, background-color 0.3s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'scale(1.05)',
                boxShadow: 6
              },
            }}
            onClick={() => navigate('/hastalar')}
          >
            <ListAltIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, transition: 'color 0.3s ease', '&:hover': { color: 'secondary.main' } }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              color: 'text.primary'
            }}>
              Kayıtlı Hastalar
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 300
            }}>
              Mevcut hasta kayıtlarını görüntülemek için tıklayın
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 