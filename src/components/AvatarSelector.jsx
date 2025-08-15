import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const AvatarSelector = ({ selectedAvatar, onAvatarSelect, open, onClose, title = "Avatar Seç" }) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchAvatars();
    }
  }, [open]);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/avatars');
      if (!response.ok) {
        throw new Error('Avatar listesi alınamadı');
      }
      
      const data = await response.json();
      setAvatars(data.avatars || []);
    } catch (err) {
      console.error('Avatar listesi hatası:', err);
      setError('Avatar listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatar) => {
    onAvatarSelect(avatar);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {avatars.length === 0 ? (
          <Box textAlign="center" py={4}>
            <PersonIcon sx={{ fontSize: 64, color: '#9CA3AF', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Henüz avatar yüklenmemiş
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              PNG dosyalarını public/avatars klasörüne ekleyin
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {avatars.map((avatar) => (
              <Grid item xs={6} sm={4} md={3} key={avatar}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedAvatar === avatar ? '2px solid #1877F2' : '1px solid #EAECF0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#1877F2',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(24, 119, 242, 0.15)'
                    }
                  }}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar
                      src={`/avatars/${avatar}`}
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 1rem auto',
                        border: '2px solid #F3F4F6'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {avatar.replace('.png', '').replace('.jpg', '').replace('.jpeg', '').replace('.svg', '')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          İptal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarSelector;
