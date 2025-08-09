import React from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
      }}
    >
      <PetsIcon sx={{ fontSize: 48, color: '#3B82F6', mb: 2 }} />
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          color: '#3B82F6',
          mb: 2
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: '#1E293B',
          fontWeight: 500
        }}
      >
        Yükleniyor...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
