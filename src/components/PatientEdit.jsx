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

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

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
    changeReason: '',
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${id}`);
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
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
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
    <div className="fade-in">
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
            color: '#2c3e50',
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
          }}>
            Hasta Düzenle
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
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
                <TextField
                  fullWidth
                  required
                  label="Protokol No"
                  name="protokolNo"
                  value={formData.protokolNo}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Hasta Adı"
                  name="hastaAdi"
                  value={formData.hastaAdi}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Hasta Sahibi"
                  name="hastaSahibi"
                  value={formData.hastaSahibi}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Tür"
                  name="tur"
                  value={formData.tur}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  
                  label="Irk"
                  name="irk"
                  value={formData.irk}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  
                  label="Cinsiyet"
                  name="cinsiyet"
                  value={formData.cinsiyet}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  
                  label="Yaş"
                  name="yas"
                  type="number"
                  value={formData.yas}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  
                  label="Kilo"
                  name="kilo"
                  type="number"
                  value={formData.kilo}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  required
                  label="VKS"
                  name="vks"
                  type="number"
                  value={formData.vks}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 1, max: 9 }}
                />
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Anamnez"
                  name="anamnez"
                  value={formData.anamnez}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  
                  label="Radyolojik Bulgular"
                  name="radyolojikBulgular"
                  value={formData.radyolojikBulgular}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  
                  label="Ultrasonografik Bulgular"
                  name="ultrasonografikBulgular"
                  value={formData.ultrasonografikBulgular}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  
                  label="Tomografi Bulgular"
                  name="tomografiBulgular"
                  value={formData.tomografiBulgular}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
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
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Biyopsi Türü</FormLabel>
                  <FormGroup row sx={{ 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 2 }
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi?.iiab}
                          onChange={handleChange}
                          name="iiab"
                        />
                      }
                      label="İİAB (ince iğne aspirasyon biyopsisi)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi?.tuse}
                          onChange={handleChange}
                          name="tuse"
                        />
                      }
                      label="Tuşe"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi?.trucat}
                          onChange={handleChange}
                          name="trucat"
                        />
                      }
                      label="Trucat Biyopsi"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi?.operasyon}
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
                  label="Biyopsi Notları"
                  name="biyopsiNot"
                  value={formData.biyopsiNot}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Patoloji"
                  name="patoloji"
                  value={formData.patoloji}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Mikroskopisi"
                  name="mikroskopisi"
                  value={formData.mikroskopisi}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Patolojik Teşhis"
                  name="patolojikTeshis"
                  value={formData.patolojikTeshis}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Tedavi"
                  name="tedavi"
                  value={formData.tedavi}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Hemogram"
                  name="hemogram"
                  value={formData.hemogram}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Biyokimya"
                  name="biyokimya"
                  value={formData.biyokimya}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Reçete"
                  name="recete"
                  value={formData.recete}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              {/* Değişiklik Nedeni */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: '#2c3e50',
                  mt: 2,
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                  Değişiklik Bilgileri
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Değişiklik Nedeni (Opsiyonel)"
                  name="changeReason"
                  value={formData.changeReason}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Bu düzenlemenin neden yapıldığını açıklayın..."
                />
              </Grid>

              {/* Butonlar */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'center'
                }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    Kaydet
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate(`/hasta/${id}`)}
                    sx={{ 
                      py: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    İptal
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default PatientEdit; 