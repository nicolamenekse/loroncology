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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ParameterInput from './ParameterInput';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

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
              
              {/* Hemogram Parametreleri - Accordion */}
              <Grid item xs={12}>
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="hemogram-content"
                    id="hemogram-header"
                    sx={{
                      backgroundColor: '#f8f9fa',
                      '&:hover': {
                        backgroundColor: '#e9ecef',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ 
                      color: '#2c3e50',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      fontWeight: 600
                    }}>
                      🔬 Hemogram Parametreleri
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
              
              {/* Lökosit Parametreleri */}
              {/* <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="WBC"
                  parameterType="hemogram"
                  value={formData.hemogram?.WBC || ''}
                  onChange={handleParameterChange('hemogram', 'WBC')}
                />
              </Grid> */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Neu#"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Neu#'] || ''}
                  onChange={handleParameterChange('hemogram', 'Neu#')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Lym#"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Lym#'] || ''}
                  onChange={handleParameterChange('hemogram', 'Lym#')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Mon#"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Mon#'] || ''}
                  onChange={handleParameterChange('hemogram', 'Mon#')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Eos#"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Eos#'] || ''}
                  onChange={handleParameterChange('hemogram', 'Eos#')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Neu%"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Neu%'] || ''}
                  onChange={handleParameterChange('hemogram', 'Neu%')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Lym%"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Lym%'] || ''}
                  onChange={handleParameterChange('hemogram', 'Lym%')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Mon%"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Mon%'] || ''}
                  onChange={handleParameterChange('hemogram', 'Mon%')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Eos%"
                  parameterType="hemogram"
                  value={formData.hemogram?.['Eos%'] || ''}
                  onChange={handleParameterChange('hemogram', 'Eos%')}
                />
              </Grid>

              {/* Eritrosit Parametreleri */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="RBC"
                  parameterType="hemogram"
                  value={formData.hemogram?.RBC || ''}
                  onChange={handleParameterChange('hemogram', 'RBC')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="HGB"
                  parameterType="hemogram"
                  value={formData.hemogram?.HGB || ''}
                  onChange={handleParameterChange('hemogram', 'HGB')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="HCT"
                  parameterType="hemogram"
                  value={formData.hemogram?.HCT || ''}
                  onChange={handleParameterChange('hemogram', 'HCT')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="MCV"
                  parameterType="hemogram"
                  value={formData.hemogram?.MCV || ''}
                  onChange={handleParameterChange('hemogram', 'MCV')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="MCH"
                  parameterType="hemogram"
                  value={formData.hemogram?.MCH || ''}
                  onChange={handleParameterChange('hemogram', 'MCH')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="MCHC"
                  parameterType="hemogram"
                  value={formData.hemogram?.MCHC || ''}
                  onChange={handleParameterChange('hemogram', 'MCHC')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="RDW-CV"
                  parameterType="hemogram"
                  value={formData.hemogram?.['RDW-CV'] || ''}
                  onChange={handleParameterChange('hemogram', 'RDW-CV')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="RDW-SD"
                  parameterType="hemogram"
                  value={formData.hemogram?.['RDW-SD'] || ''}
                  onChange={handleParameterChange('hemogram', 'RDW-SD')}
                />
              </Grid>

              {/* Trombosit Parametreleri */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="PLT"
                  parameterType="hemogram"
                  value={formData.hemogram?.PLT || ''}
                  onChange={handleParameterChange('hemogram', 'PLT')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="MPV"
                  parameterType="hemogram"
                  value={formData.hemogram?.MPV || ''}
                  onChange={handleParameterChange('hemogram', 'MPV')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="PDW"
                  parameterType="hemogram"
                  value={formData.hemogram?.PDW || ''}
                  onChange={handleParameterChange('hemogram', 'PDW')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="PCT"
                  parameterType="hemogram"
                  value={formData.hemogram?.PCT || ''}
                  onChange={handleParameterChange('hemogram', 'PCT')}
                />
              </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Biyokimya Parametreleri - Accordion */}
              <Grid item xs={12}>
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="biyokimya-content"
                    id="biyokimya-header"
                    sx={{
                      backgroundColor: '#f8f9fa',
                      '&:hover': {
                        backgroundColor: '#e9ecef',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ 
                      color: '#2c3e50',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      fontWeight: 600
                    }}>
                      ⚗️ Biyokimya Parametreleri
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>

              {/* Protein Parametreleri */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="TP"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.TP || ''}
                  onChange={handleParameterChange('biyokimya', 'TP')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="ALB"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.ALB || ''}
                  onChange={handleParameterChange('biyokimya', 'ALB')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="GLD"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.GLD || ''}
                  onChange={handleParameterChange('biyokimya', 'GLD')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="A/G"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.['A/G'] || ''}
                  onChange={handleParameterChange('biyokimya', 'A/G')}
                />
              </Grid>

              {/* Karaciğer Enzimleri */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="TBIL"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.TBIL || ''}
                  onChange={handleParameterChange('biyokimya', 'TBIL')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="ALT"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.ALT || ''}
                  onChange={handleParameterChange('biyokimya', 'ALT')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="AST"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.AST || ''}
                  onChange={handleParameterChange('biyokimya', 'AST')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="AST/ALT"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.['AST/ALT'] || ''}
                  onChange={handleParameterChange('biyokimya', 'AST/ALT')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="GGT"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.GGT || ''}
                  onChange={handleParameterChange('biyokimya', 'GGT')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="ALP"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.ALP || ''}
                  onChange={handleParameterChange('biyokimya', 'ALP')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="TBA"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.TBA || ''}
                  onChange={handleParameterChange('biyokimya', 'TBA')}
                />
              </Grid>

              {/* Diğer Enzimler */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="CK"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.CK || ''}
                  onChange={handleParameterChange('biyokimya', 'CK')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="AMY"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.AMY || ''}
                  onChange={handleParameterChange('biyokimya', 'AMY')}
                />
              </Grid>

              {/* Lipidler */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="TG"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.TG || ''}
                  onChange={handleParameterChange('biyokimya', 'TG')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="CHOL"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.CHOL || ''}
                  onChange={handleParameterChange('biyokimya', 'CHOL')}
                />
              </Grid>

              {/* Glukoz ve Böbrek Fonksiyonları */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="GLU"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.GLU || ''}
                  onChange={handleParameterChange('biyokimya', 'GLU')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="CRE"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.CRE || ''}
                  onChange={handleParameterChange('biyokimya', 'CRE')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="BUN"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.BUN || ''}
                  onChange={handleParameterChange('biyokimya', 'BUN')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="BUN/CRE"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.['BUN/CRE'] || ''}
                  onChange={handleParameterChange('biyokimya', 'BUN/CRE')}
                />
              </Grid>

              {/* Elektrolitler */}
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="tCO2"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.tCO2 || ''}
                  onChange={handleParameterChange('biyokimya', 'tCO2')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Ca"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.Ca || ''}
                  onChange={handleParameterChange('biyokimya', 'Ca')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="P"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.P || ''}
                  onChange={handleParameterChange('biyokimya', 'P')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Ca*P"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.['Ca*P'] || ''}
                  onChange={handleParameterChange('biyokimya', 'Ca*P')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ParameterInput
                  parameter="Mg"
                  parameterType="biyokimya"
                  value={formData.biyokimya?.Mg || ''}
                  onChange={handleParameterChange('biyokimya', 'Mg')}
                />
              </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
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