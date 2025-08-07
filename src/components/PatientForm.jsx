import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
  Container,
  Checkbox,
  FormGroup,
  FormLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ParameterCalculator from './ParameterCalculator';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const PatientForm = () => {
  const navigate = useNavigate();
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
    hemogram: {
      WBC: '', 'Neu#': '', 'Lym#': '', 'Mon#': '', 'Eos#': '', 
      'Neu%': '', 'Lym%': '', 'Mon%': '', 'Eos%': '', 
      RBC: '', HGB: '', HCT: '', MCV: '', MCH: '', MCHC: '', 
      'RDW-CV': '', 'RDW-SD': '', PLT: '', MPV: '', PDW: '', PCT: ''
    },
    biyokimya: {
      TP: '', ALB: '', GLD: '', 'A/G': '', TBIL: '', ALT: '', AST: '', 'AST/ALT': '', 
      GGT: '', ALP: '', TBA: '', CK: '', AMY: '', TG: '', CHOL: '', GLU: '', 
      CRE: '', BUN: '', 'BUN/CRE': '', tCO2: '', Ca: '', P: '', 'Ca*P': '', Mg: ''
    },
    recete: '',
    biyopsi: {
      iiab: false,
      tuse: false,
      trucat: false,
      operasyon: false,
    },
    biyopsiNot: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        biyopsi: {
          ...prev.biyopsi,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Hemogram ve biyokimya parametreleri için özel handleChange
  const handleParameterChange = (parameterType, parameter) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [parameterType]: {
        ...prev[parameterType],
        [parameter]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Form verilerini kontrol et
      if (!formData.protokolNo || !formData.hastaAdi || !formData.hastaSahibi || 
          !formData.tur || !formData.yas || !formData.vks) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun.');
      }

      // VKS değerini kontrol et
      if (formData.vks < 1 || formData.vks > 9) {
        throw new Error('VKS değeri 1-9 arasında olmalıdır.');
      }

      console.log('API URL:', API_URL);
      console.log('Form verileri gönderiliyor:', formData);
      console.log('Posting to:', `${API_URL}/api/patients`);
      
      const response = await fetch(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sunucu bağlantısı bulunamadı. Lütfen daha sonra tekrar deneyin.');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Geçersiz form verisi. Lütfen tüm alanları kontrol edin.');
        } else if (response.status === 500) {
          throw new Error(data.message || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error(data.message || 'Hasta kaydı oluşturulurken bir hata oluştu');
        }
      }

      if (data && data.patient) {
        alert('Hasta kaydı başarıyla oluşturuldu!');
        navigate('/hastalar');
      } else {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
    } catch (error) {
      console.error('Form gönderim hatası:', error);
      alert(error.message || 'Hasta kaydı oluşturulurken bir hata oluştu!');
    }
  };

  return (
    <div className="fade-in">
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
            color: '#2c3e50',
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
          }}>
            Yeni Hasta Kaydı
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
                  required
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
                  label="radyolojik bulgular"
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
                  label="Klinik Bulgular"
                  name="klinikBulgular"
                  value={formData.klinikBulgular}
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
                  label="Ultrasonografik bulgular"
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
                  label="Tomografi bulgular"
                  name="tomografiBulgular"
                  value={formData.tomografiBulgular}
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
                  label="Patoloji"
                  name="patoloji"
                  value={formData.patoloji}
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
                  label="Mikroskopisi"
                  name="mikroskopisi"
                  value={formData.mikroskopisi}
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
                  label="Patolojik Teshıs"
                  name="patolojikTeshis"
                  value={formData.patolojikTeshis}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>

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
                          checked={formData.biyopsi.iiab}
                          onChange={handleChange}
                          name="iiab"
                        />
                      }
                      label="İİAB (ince iğne aspirasyon biyopsisi)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi.tuse}
                          onChange={handleChange}
                          name="tuse"
                        />
                      }
                      label="Tuşe"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi.trucat}
                          onChange={handleChange}
                          name="trucat"
                        />
                      }
                      label="Trucat Biyopsi"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.biyopsi.operasyon}
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

             

              <ParameterCalculator
                formData={formData}
                handleParameterChange={handleParameterChange}
              />

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tedavi"
                  name="tedavi"
                  value={formData.tedavi}
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
                  label="Recete"
                  name="recete"
                  value={formData.recete}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>


              {/* Patoloji ve Biyopsi Bilgileri */}
             

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
                    onClick={() => navigate('/patients')}
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

export default PatientForm; 