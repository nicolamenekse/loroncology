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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Form verilerini kontrol et
      if (!formData.protokolNo || !formData.hastaAdi || !formData.hastaSahibi || 
          !formData.tur || !formData.irk || !formData.cinsiyet || 
          !formData.yas || !formData.kilo || !formData.vks || !formData.anamnez) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun.');
      }

      // VKS değerini kontrol et
      if (formData.vks < 1 || formData.vks > 9) {
        throw new Error('VKS değeri 1-9 arasında olmalıdır.');
      }

      console.log('Form verileri gönderiliyor:', formData);
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Ana Sayfaya Dön
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Veteriner Hasta Takip Formu
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Temel Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Temel Bilgiler
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Protokol No"
                name="protokolNo"
                value={formData.protokolNo}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hasta Adı"
                name="hastaAdi"
                value={formData.hastaAdi}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hasta Sahibi"
                name="hastaSahibi"
                value={formData.hastaSahibi}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Irk"
                name="irk"
                value={formData.irk}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <Typography component="legend">VKS (1-9)</Typography>
                <Rating
                  name="vks"
                  value={formData.vks}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      vks: newValue,
                    }));
                  }}
                  max={9}
                />
              </FormControl>
            </Grid>

            {/* Klinik Bilgiler */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Klinik Bilgiler
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Anamnez"
                name="anamnez"
                value={formData.anamnez}
                onChange={handleChange}
                required
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Radyolojik Bulgular"
                name="radyolojikBulgular"
                value={formData.radyolojikBulgular}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ultrasonografik Bulgular"
                name="ultrasonografikBulgular"
                value={formData.ultrasonografikBulgular}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tomografi Bulguları"
                name="tomografiBulgular"
                value={formData.tomografiBulgular}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            {/* Patoloji Bilgileri */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Patoloji Bilgileri
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patoloji"
                name="patoloji"
                value={formData.patoloji}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mikroskopisi"
                name="mikroskopisi"
                value={formData.mikroskopisi}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patolojik Teşhis"
                name="patolojikTeshis"
                value={formData.patolojikTeshis}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            {/* Tedavi ve Laboratuvar */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tedavi ve Laboratuvar
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tedavi"
                name="tedavi"
                value={formData.tedavi}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hemogram"
                name="hemogram"
                value={formData.hemogram}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Biyokimya"
                name="biyokimya"
                value={formData.biyokimya}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reçete"
                name="recete"
                value={formData.recete}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            {/* Biyopsi Seçenekleri */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Biyopsi Seçenekleri
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Biyopsi Türü</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.biyopsi.iiab}
                        onChange={handleChange}
                        name="iiab"
                      />
                    }
                    label="İİAB (İnce İğne Aspirasyon Biyopsisi)"
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
                multiline
                rows={4}
                label="Biyopsi Notları"
                name="biyopsiNot"
                value={formData.biyopsiNot}
                onChange={handleChange}
                placeholder="Biyopsi ile ilgili eklemek istediğiniz notları buraya yazabilirsiniz..."
              />
            </Grid>

            {/* Kaydet Butonu */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<PetsIcon />}
              >
                Hasta Kaydını Oluştur
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PatientForm; 