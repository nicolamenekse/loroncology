import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { getDoctors } from '../services/consultationService';
import { getAllDoctors } from '../services/colleagueService';
import { sendConnectionRequest, respondToConnectionRequest, removeConnection } from '../services/colleagueService';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import DeleteIcon from '@mui/icons-material/Delete';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await getAllDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (doctor) => {
    try {
      await sendConnectionRequest(doctor._id);
      setSnackbar({
        open: true,
        message: 'Bağlantı isteği başarıyla gönderildi',
        severity: 'success'
      });
      fetchDoctors(); // Listeyi güncelle
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleRespond = async (connectionId, status) => {
    try {
      await respondToConnectionRequest(connectionId, status);
      setSnackbar({
        open: true,
        message: status === 'accepted' ? 'Bağlantı isteği kabul edildi' : 'Bağlantı isteği reddedildi',
        severity: 'success'
      });
      fetchDoctors(); // Listeyi güncelle
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await removeConnection(connectionId);
      setSnackbar({
        open: true,
        message: 'Bağlantı başarıyla kaldırıldı',
        severity: 'success'
      });
      fetchDoctors(); // Listeyi güncelle
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const getConnectionButton = (doctor) => {
    switch (doctor.connectionStatus) {
      case 'self':
        return null;
      case 'connected':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<CheckIcon />}
              label="Bağlantılı"
              color="success"
              variant="outlined"
            />
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => handleRemoveConnection(doctor.connectionId)}
              startIcon={<DeleteIcon />}
              sx={{ fontSize: '0.75rem', py: 0.5 }}
            >
              Bağlantıyı Kaldır
            </Button>
          </Box>
        );
      case 'sent':
        return (
          <Chip
            icon={<PendingIcon />}
            label="İstek Gönderildi"
            color="primary"
            variant="outlined"
          />
        );
      case 'received':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckIcon />}
              onClick={() => handleRespond(doctor.connectionId, 'accepted')}
            >
              Kabul Et
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CloseIcon />}
              onClick={() => handleRespond(doctor.connectionId, 'rejected')}
            >
              Reddet
            </Button>
          </Box>
        );
      case 'rejected':
        return (
          <Chip
            icon={<CloseIcon />}
            label="Reddedildi"
            color="error"
            variant="outlined"
          />
        );
      default:
        return (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => handleConnect(doctor)}
          >
            Meslektaş Ekle
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Veteriner Hekimler
      </Typography>

      <Grid container spacing={3}>
        {doctors.map((doctor) => (
          <Grid item xs={12} sm={6} md={4} key={doctor._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Dr. {doctor.name}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {doctor.mainSpecialty}
                </Typography>

                {doctor.subspecialties?.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Alt Uzmanlıklar:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {doctor.subspecialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  {getConnectionButton(doctor)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DoctorsList;
