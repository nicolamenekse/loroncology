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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';

const PatientDetail = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        throw new Error('Hasta bilgileri yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setPatient(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Container>
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Hasta bulunamadı
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/hastalar')}
        >
          Hasta Listesine Dön
        </Button>
        <Box>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            color="primary"
            onClick={() => navigate(`/hasta-duzenle/${id}`)}
            sx={{ mr: 2 }}
          >
            Düzenle
          </Button>
          <Button
            startIcon={<PrintIcon />}
            variant="outlined"
            onClick={handlePrint}
          >
            Yazdır
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            {patient.hastaAdi}
          </Typography>
          <Chip
            icon={<PetsIcon />}
            label={`${patient.tur === 'Kedi' ? '🐱' : '🐕'} ${patient.tur}`}
            color={patient.tur === 'Kedi' ? 'primary' : 'secondary'}
            variant="outlined"
          />
        </Box>

        <Grid container spacing={4}>
          {/* Temel Bilgiler */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Temel Bilgiler
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Protokol No</Typography>
                <Typography variant="body1">{patient.protokolNo}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Hasta Sahibi</Typography>
                <Typography variant="body1">{patient.hastaSahibi}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Irk</Typography>
                <Typography variant="body1">{patient.irk}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Cinsiyet</Typography>
                <Typography variant="body1">{patient.cinsiyet}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Yaş</Typography>
                <Typography variant="body1">{patient.yas} yaş</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Kilo</Typography>
                <Typography variant="body1">{patient.kilo} kg</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">VKS</Typography>
                <Chip
                  label={`VKS: ${patient.vks}`}
                  color={patient.vks > 5 ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Klinik Bilgiler */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Klinik Bilgiler
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Anamnez</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.anamnez}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Radyolojik Bulgular</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.radyolojikBulgular || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Ultrasonografik Bulgular</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.ultrasonografikBulgular || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Tomografi Bulguları</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.tomografiBulgular || '-'}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Patoloji Bilgileri */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Patoloji Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Patoloji</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.patoloji || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Mikroskopisi</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.mikroskopisi || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Patolojik Teşhis</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.patolojikTeshis || '-'}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Tedavi ve Laboratuvar */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Tedavi ve Laboratuvar
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Tedavi</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.tedavi || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Hemogram</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.hemogram || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Biyokimya</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.biyokimya || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Reçete</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{patient.recete || '-'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PatientDetail; 