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
  Collapse,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { isValueInRange, getReferenceRangeText } from '../config/referenceRanges';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const PatientForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    protokolNo: '',
    hastaAdi: '',
    hastaSahibi: '',
    tur: 'Kedi',
    irk: '',
    cinsiyet: 'Erkek',
    yas: '',
    kilo: '',
    vks: 5,
    anamnez: '',
    klinikBulgular: '',
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

  const [hemogramCollapsed, setHemogramCollapsed] = useState(false);
  const [biyokimyaCollapsed, setBiyokimyaCollapsed] = useState(false);

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

  // Değerin referans aralığında olup olmadığını kontrol eden fonksiyon
  const getValueColor = (value, parameter, parameterType) => {
    if (formData.tur !== 'Kedi' || !value || value === '') return 'inherit';
    
    const isInRange = isValueInRange(value, parameter, parameterType);
    if (isInRange === null) return 'inherit';
    
    return isInRange ? '#2e7d32' : '#d32f2f'; // Yeşil: normal, Kırmızı: anormal
  };

  // Hemogram parametrelerini render eden fonksiyon
  const renderHemogramPanel = () => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: 'fit-content',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '2px solid #e3f2fd'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
        cursor: 'pointer'
      }}
      onClick={() => setHemogramCollapsed(!hemogramCollapsed)}
      >
        <Typography variant="h6" sx={{ 
          color: '#1976d2',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          🩸 Hemogram Parametreleri
        </Typography>
        <IconButton size="small">
          {hemogramCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={!hemogramCollapsed}>
        <Grid container spacing={1}>
          {/* Lökosit Parametreleri */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
              Lökosit Parametreleri
            </Typography>
          </Grid>
          {[
            'WBC', 'Neu#', 'Lym#', 'Mon#', 'Eos#',
            'Neu%', 'Lym%', 'Mon%', 'Eos%'
          ].map((param) => (
            <Grid item xs={6} key={param}>
              <TextField
                fullWidth
                size="small"
                label={param}
                value={formData.hemogram[param] || ''}
                onChange={handleParameterChange('hemogram', param)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& input': {
                      color: getValueColor(formData.hemogram[param], param, 'hemogram'),
                      fontWeight: formData.tur === 'Kedi' ? 500 : 400
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  }
                }}
                InputProps={{
                  endAdornment: formData.tur === 'Kedi' && formData.hemogram[param] && (
                    <Typography variant="caption" sx={{ 
                      color: getValueColor(formData.hemogram[param], param, 'hemogram'),
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {getReferenceRangeText(param, 'hemogram')}
                    </Typography>
                  )
                }}
              />
            </Grid>
          ))}

          {/* Eritrosit Parametreleri */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
              Eritrosit Parametreleri
            </Typography>
          </Grid>
          {[
            'RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC',
            'RDW-CV', 'RDW-SD'
          ].map((param) => (
            <Grid item xs={6} key={param}>
              <TextField
                fullWidth
                size="small"
                label={param}
                value={formData.hemogram[param] || ''}
                onChange={handleParameterChange('hemogram', param)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& input': {
                      color: getValueColor(formData.hemogram[param], param, 'hemogram'),
                      fontWeight: formData.tur === 'Kedi' ? 500 : 400
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  }
                }}
                InputProps={{
                  endAdornment: formData.tur === 'Kedi' && formData.hemogram[param] && (
                    <Typography variant="caption" sx={{ 
                      color: getValueColor(formData.hemogram[param], param, 'hemogram'),
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {getReferenceRangeText(param, 'hemogram')}
                    </Typography>
                  )
                }}
              />
            </Grid>
          ))}

          {/* Trombosit Parametreleri */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
              Trombosit Parametreleri
            </Typography>
          </Grid>
          {[
            'PLT', 'MPV', 'PDW', 'PCT'
          ].map((param) => (
            <Grid item xs={6} key={param}>
              <TextField
                fullWidth
                size="small"
                label={param}
                value={formData.hemogram[param] || ''}
                onChange={handleParameterChange('hemogram', param)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& input': {
                      color: getValueColor(formData.hemogram[param], param, 'hemogram'),
                      fontWeight: formData.tur === 'Kedi' ? 500 : 400
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  }
                }}
                InputProps={{
                  endAdornment: formData.tur === 'Kedi' && formData.hemogram[param] && (
                    <Typography variant="caption" sx={{ 
                      color: getValueColor(formData.hemogram[param], param, 'hemogram'),
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {getReferenceRangeText(param, 'hemogram')}
                    </Typography>
                  )
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Paper>
  );

  // Biyokimya parametrelerini render eden fonksiyon
  const renderBiyokimyaPanel = () => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: 'fit-content',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '2px solid #e8f5e8'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2,
        cursor: 'pointer'
      }}
      onClick={() => setBiyokimyaCollapsed(!biyokimyaCollapsed)}
      >
        <Typography variant="h6" sx={{ 
          color: '#2e7d32',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          🧪 Biyokimya Parametreleri
        </Typography>
        <IconButton size="small">
          {biyokimyaCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      <Collapse in={!biyokimyaCollapsed}>
        <Grid container spacing={1}>
          {/* Protein Parametreleri */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
              Protein Parametreleri
            </Typography>
          </Grid>
          {[
            'TP', 'ALB', 'GLD', 'A/G'
          ].map((param) => (
            <Grid item xs={6} key={param}>
              <TextField
                fullWidth
                size="small"
                label={param}
                value={formData.biyokimya[param] || ''}
                onChange={handleParameterChange('biyokimya', param)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& input': {
                      color: getValueColor(formData.biyokimya[param], param, 'biyokimya'),
                      fontWeight: formData.tur === 'Kedi' ? 500 : 400
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  }
                }}
                InputProps={{
                  endAdornment: formData.tur === 'Kedi' && formData.biyokimya[param] && (
                    <Typography variant="caption" sx={{ 
                      color: getValueColor(formData.biyokimya[param], param, 'biyokimya'),
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {getReferenceRangeText(param, 'biyokimya')}
                    </Typography>
                  )
                }}
              />
            </Grid>
          ))}

          {/* Karaciğer Enzimleri */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
              Karaciğer Enzimleri
            </Typography>
          </Grid>
          {[
            'TBIL', 'ALT', 'AST', 'AST/ALT', 'GGT', 'ALP', 'TBA'
          ].map((param) => (
            <Grid item xs={6} key={param}>
              <TextField
                fullWidth
                size="small"
                label={param}
                value={formData.biyokimya[param] || ''}
                onChange={handleParameterChange('biyokimya', param)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& input': {
                      color: getValueColor(formData.biyokimya[param], param, 'biyokimya'),
                      fontWeight: formData.tur === 'Kedi' ? 500 : 400
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  }
                }}
                InputProps={{
                  endAdornment: formData.tur === 'Kedi' && formData.biyokimya[param] && (
                    <Typography variant="caption" sx={{ 
                      color: getValueColor(formData.biyokimya[param], param, 'biyokimya'),
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {getReferenceRangeText(param, 'biyokimya')}
                    </Typography>
                  )
                }}
              />
            </Grid>
          ))}

          {/* Diğer Parametreler */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
              Diğer Parametreler
            </Typography>
          </Grid>
          {[
            'CK', 'AMY', 'TG', 'CHOL', 'GLU', 'CRE', 'BUN', 'BUN/CRE',
            'tCO2', 'Ca', 'P', 'Ca*P', 'Mg'
          ].map((param) => (
            <Grid item xs={6} key={param}>
              <TextField
                fullWidth
                size="small"
                label={param}
                value={formData.biyokimya[param] || ''}
                onChange={handleParameterChange('biyokimya', param)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& input': {
                      color: getValueColor(formData.biyokimya[param], param, 'biyokimya'),
                      fontWeight: formData.tur === 'Kedi' ? 500 : 400
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  }
                }}
                InputProps={{
                  endAdornment: formData.tur === 'Kedi' && formData.biyokimya[param] && (
                    <Typography variant="caption" sx={{ 
                      color: getValueColor(formData.biyokimya[param], param, 'biyokimya'),
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {getReferenceRangeText(param, 'biyokimya')}
                    </Typography>
                  )
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Paper>
  );

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

      // Tür değerini kontrol et
      if (!['Kedi', 'Köpek'].includes(formData.tur)) {
        throw new Error('Tür değeri "Kedi" veya "Köpek" olmalıdır.');
      }

      // Cinsiyet değerini kontrol et
      if (!['Erkek', 'Dişi'].includes(formData.cinsiyet)) {
        throw new Error('Cinsiyet değeri "Erkek" veya "Dişi" olmalıdır.');
      }

      console.log('API URL:', API_URL);
      console.log('Form verileri gönderiliyor:', formData);
      console.log('Posting to:', `${API_URL}/api/patients`);
      
      const response = await fetch(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    <div className="patient-form-wrapper fade-in">
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Grid container spacing={3}>
          {/* Sol Panel - Biyokimya */}
          <Grid item xs={12} md={3}>
            {renderBiyokimyaPanel()}
          </Grid>

          {/* Orta Panel - Ana Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
                color: '#3B82F6',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                mb: 4,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Yeni Hasta Kaydı
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {/* Hasta Bilgileri */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ 
                      color: '#1a2980',
                      mb: 3,
                      fontSize: { xs: '1.2rem', sm: '1.35rem' },
                      fontWeight: 600,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                        borderRadius: '2px'
                      }
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Tür</InputLabel>
                      <Select
                        name="tur"
                        value={formData.tur}
                        onChange={handleChange}
                        label="Tür"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }}
                      >
                        <MenuItem value="Kedi">Kedi</MenuItem>
                        <MenuItem value="Köpek">Köpek</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="Irk"
                      name="irk"
                      value={formData.irk}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Cinsiyet</InputLabel>
                      <Select
                        name="cinsiyet"
                        value={formData.cinsiyet}
                        onChange={handleChange}
                        label="Cinsiyet"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }}
                      >
                        <MenuItem value="Erkek">Erkek</MenuItem>
                        <MenuItem value="Dişi">Dişi</MenuItem>
                      </Select>
                    </FormControl>
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="Kilo"
                      name="kilo"
                      type="number"
                      value={formData.kilo}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          }
                        }
                      }}
                      inputProps={{ min: 1, max: 9 }}
                    />
                  </Grid>

                  {/* Klinik Bilgileri */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ 
                      color: '#1a2980',
                      mt: 4,
                      mb: 3,
                      fontSize: { xs: '1.2rem', sm: '1.35rem' },
                      fontWeight: 600,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                        borderRadius: '2px'
                      }
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
                      color: '#1a2980',
                      mt: 4,
                      mb: 3,
                      fontSize: { xs: '1.2rem', sm: '1.35rem' },
                      fontWeight: 600,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                        borderRadius: '2px'
                      }
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
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
                            transform: 'translateY(-1px)'
                          }
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
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        İptal
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Sağ Panel - Hemogram */}
          <Grid item xs={12} md={3}>
            {renderHemogramPanel()}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default PatientForm; 