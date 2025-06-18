import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const PatientDetail = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${id}`);
      if (!response.ok) {
        throw new Error('Hasta bilgileri yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setPatient(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fade-in">
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography variant="h4" component="h1" sx={{ 
              color: '#2c3e50',
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}>
              Hasta Detayları
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/hastalar')}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Geri Dön
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handlePrint}
                startIcon={<PrintIcon />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Yazdır
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/hasta-duzenle/${id}`)}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Düzenle
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : patient ? (
            <>
              {/* Print Header - Only visible when printing */}
              <Box sx={{ 
                display: 'none',
                '@media print': {
                  display: 'block',
                  textAlign: 'center',
                  mb: 3,
                  borderBottom: '2px solid #000',
                  pb: 2
                }
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  LORONKOLOJI HASTA KAYIT FORMU
                </Typography>
                <Typography variant="subtitle1">
                  Hasta Detay Raporu - {new Date().toLocaleDateString('tr-TR')}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Hasta Bilgileri */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#2c3e50',
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    Hasta Bilgileri
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Protokol No
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.protokolNo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Hasta Adı
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.hastaAdi}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Hasta Sahibi
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.hastaSahibi}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Tür
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.tur}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Irk
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.irk}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Cinsiyet
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.cinsiyet}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Yaş
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.yas} yaş
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Kilo
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.kilo} kg
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    VKS
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.vks}
                  </Typography>
                </Grid>

                {/* Klinik Bilgileri */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#2c3e50',
                    mt: 2,
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    Klinik Bilgileri
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Anamnez
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.anamnez}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Radyolojik Bulgular
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.radyolojikBulgular}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Ultrasonografik Bulgular
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.ultrasonografikBulgular}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Tomografi Bulgular
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.tomografiBulgular}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Patoloji
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.patoloji}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Mikroskopisi
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.mikroskopisi}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Patolojik Teşhis
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.patolojikTeshis}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Tedavi
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.tedavi}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Hemogram
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.hemogram}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Biyokimya
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.biyokimya}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Reçete
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.recete}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Biyopsi Not
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {patient.biyopsiNot}
                  </Typography>
                </Grid>

                {/* Patoloji ve Biyopsi Bilgileri */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#2c3e50',
                    mt: 2,
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    Patoloji ve Biyopsi Bilgileri
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Biyopsi Türü
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {patient.biyopsi?.iiab && (
                      <Chip 
                        label="İİAB (ince iğne aspirasyon biyopsisi)" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ m: 0.5 }}
                      />
                    )}
                    {patient.biyopsi?.tuse && (
                      <Chip 
                        label="Tuşe" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ m: 0.5 }}
                      />
                    )}
                    {patient.biyopsi?.trucat && (
                      <Chip 
                        label="Trucat Biyopsi" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ m: 0.5 }}
                      />
                    )}
                    {patient.biyopsi?.operasyon && (
                      <Chip 
                        label="Operasyon" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ m: 0.5 }}
                      />
                    )}
                    {!patient.biyopsi?.iiab && !patient.biyopsi?.tuse && 
                     !patient.biyopsi?.trucat && !patient.biyopsi?.operasyon && (
                      <Typography variant="body2" color="text.secondary">
                        Biyopsi yapılmadı
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : (
            <Alert severity="info">
              Hasta bulunamadı.
            </Alert>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default PatientDetail; 