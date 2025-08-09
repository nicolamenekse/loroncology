import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          mt: 8,
          p: 4,
          textAlign: 'center',
          background: 'transparent'
        }}
      >
        <PetsIcon sx={{ fontSize: 60, color: '#3B82F6', mb: 2 }} />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            color: '#1E293B',
            mb: 2
          }}
        >
          404 - Sayfa Bulunamadı
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            color: '#64748B',
            mb: 4
          }}
        >
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#3B82F6',
            fontSize: '1rem',
            py: 1.5,
            px: 4,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#2563EB'
            }
          }}
        >
          Ana Sayfaya Dön
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;
