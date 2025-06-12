import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  CircularProgress,
  Checkbox,
  FormGroup,
  FormLabel,
  FormControlLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const PatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    protokolNo: '',
    hastaAdi: '',
    hastaSahibi: '',
    tur: '',
    irk: '',
    cinsiyet: '',
    yas: '',
    kilo: '',
    vks: 5,
    anamnez: '',
    radyolojikBulgular: '',
    ultrasonografikBulgular: '',
    tomografiBulgular: '',
    patoloji: '',
    mikroskopisi: '',
    patolojikTeshis: '',
    tedavi: '',
    hemogram: '',
    biyokimya: '',
    recete: '',
    biyopsi: {
      iiab: false,
      tuse: false,
      trucat: false,
      operasyon: false,
    },
    biyopsiNot: '',
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) {
        throw new Error('Hasta bilgileri yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setFormData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        biyopsi: {
          ...prev.biyopsi,
          [name]: checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Hasta bilgileri güncellenirken bir hata oluştu');
      }

      alert('Hasta bilgileri başarıyla güncellendi');
      navigate(`/hasta/${id}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/hasta/${id}`)}
          sx={{ mb: 2 }}
        >
          Hasta Detayına Dön
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Hasta Bilgilerini Düzenle
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Temel Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Temel Bilgiler
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Protokol No"
                name="protokolNo"
                value={formData.protokolNo}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hasta Adı"
                name="hastaAdi"
                value={formData.hastaAdi}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hasta Sahibi"
                name="hastaSahibi"
                value={formData.hastaSahibi}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Tür</InputLabel>
                <Select
                  name="tur"
                  value={formData.tur}
                  onChange={handleChange}
                  label="Tür"
                >
                  <MenuItem value="Kedi">🐱 Kedi</MenuItem>
                  <MenuItem value="Köpek">🐕 Köpek</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Irk"
                name="irk"
                value={formData.irk}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  name="cinsiyet"
                  value={formData.cinsiyet}
                  onChange={handleChange}
                  label="Cinsiyet"
                >
                  <MenuItem value="Erkek">Erkek</MenuItem>
                  <MenuItem value="Dişi">Dişi</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Yaş"
                name="yas"
                type="number"
                value={formData.yas}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Kilo (kg)"
                name="kilo"
                type="number"
                value={formData.kilo}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography component="legend">Vücut Kondisyon Skoru (VKS)</Typography>
              <Rating
                name="vks"
                value={formData.vks}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, vks: newValue }));
                }}
                max={9}
              />
            </Grid>

            {/* Klinik Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Klinik Bilgiler
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Anamnez"
                name="anamnez"
                multiline
                rows={4}
                value={formData.anamnez}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Radyolojik Bulgular"
                name="radyolojikBulgular"
                multiline
                rows={4}
                value={formData.radyolojikBulgular}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ultrasonografik Bulgular"
                name="ultrasonografikBulgular"
                multiline
                rows={4}
                value={formData.ultrasonografikBulgular}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tomografi Bulguları"
                name="tomografiBulgular"
                multiline
                rows={4}
                value={formData.tomografiBulgular}
                onChange={handleChange}
              />
            </Grid>

            {/* Patoloji ve Biyopsi Bilgileri */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Patoloji ve Biyopsi Bilgileri
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Biyopsi Türü</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.biyopsi?.iiab || false}
                        onChange={handleChange}
                        name="iiab"
                      />
                    }
                    label="İİAB (İnce İğne Aspirasyon Biyopsisi)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.biyopsi?.tuse || false}
                        onChange={handleChange}
                        name="tuse"
                      />
                    }
                    label="Tuşe"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.biyopsi?.trucat || false}
                        onChange={handleChange}
                        name="trucat"
                      />
                    }
                    label="Trucat Biyopsi"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.biyopsi?.operasyon || false}
                        onChange={handleChange}
                        name="operasyon"
                      />
                    }
                    label="Operasyon"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Biyopsi Notları"
                name="biyopsiNot"
                value={formData.biyopsiNot || ''}
                onChange={handleChange}
                placeholder="Biyopsi ile ilgili eklemek istediğiniz notları buraya yazabilirsiniz..."
              />
            </Grid>

            {/* Tedavi ve Laboratuvar */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Tedavi ve Laboratuvar
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tedavi"
                name="tedavi"
                multiline
                rows={4}
                value={formData.tedavi}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hemogram"
                name="hemogram"
                multiline
                rows={4}
                value={formData.hemogram}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Biyokimya"
                name="biyokimya"
                multiline
                rows={4}
                value={formData.biyokimya}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reçete"
                name="recete"
                multiline
                rows={4}
                value={formData.recete}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}
                >
                  Değişiklikleri Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientEdit; 