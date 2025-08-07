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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ParameterInput from './ParameterInput';
import { hemogramParameters, biyokimyaParameters } from '../config/referenceRanges';
import AIAnalysis from './AIAnalysis';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const PatientDetail = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
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

  const fetchPatientHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = await fetch(`${API_URL}/api/patients/${id}/history`);
      if (!response.ok) {
        throw new Error('Hasta geçmişi yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('History Error:', error);
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && history.length === 0) {
      fetchPatientHistory();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="patient-detail-wrapper fade-in">
      <Container maxWidth="lg">
        <Paper elevation={3} className="patient-detail-paper" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography variant="h4" component="h1" sx={{ 
              color: '#3B82F6',
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
                  mb: 4
                }
              }}>
                <Box sx={{ textAlign: 'center', borderBottom: '2px solid #000', pb: 2, mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    LORONKOLOJI HASTA KAYIT FORMU
                  </Typography>
                  <Typography variant="subtitle1">
                    Hasta Detay Raporu - {new Date().toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                
                <Box className="print-grid">
                  <Box>
                    <Typography className="print-label">Protokol No</Typography>
                    <Typography className="print-value">{patient.protokolNo}</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Hasta Adı</Typography>
                    <Typography className="print-value">{patient.hastaAdi}</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Hasta Sahibi</Typography>
                    <Typography className="print-value">{patient.hastaSahibi}</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Tür</Typography>
                    <Typography className="print-value">{patient.tur}</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Irk</Typography>
                    <Typography className="print-value">{patient.irk}</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Yaş</Typography>
                    <Typography className="print-value">{patient.yas} yaş</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Cinsiyet</Typography>
                    <Typography className="print-value">{patient.cinsiyet}</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">Kilo</Typography>
                    <Typography className="print-value">{patient.kilo} kg</Typography>
                  </Box>
                  <Box>
                    <Typography className="print-label">VKS</Typography>
                    <Typography className="print-value">{patient.vks}</Typography>
                  </Box>
                </Box>

                <Typography className="print-section-title">Klinik Bilgileri</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Anamnez</Typography>
                  <Typography className="print-value">{patient.anamnez}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Radyolojik Bulgular</Typography>
                  <Typography className="print-value">{patient.radyolojikBulgular}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Ultrasonografik Bulgular</Typography>
                  <Typography className="print-value">{patient.ultrasonografikBulgular}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Tomografi Bulgular</Typography>
                  <Typography className="print-value">{patient.tomografiBulgular}</Typography>
                </Box>

                <Typography className="print-section-title">Patoloji Bilgileri</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Patoloji</Typography>
                  <Typography className="print-value">{patient.patoloji}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Mikroskopisi</Typography>
                  <Typography className="print-value">{patient.mikroskopisi}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Patolojik Teşhis</Typography>
                  <Typography className="print-value">{patient.patolojikTeshis}</Typography>
                </Box>

                <Typography className="print-section-title">Tedavi ve Reçete</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Tedavi</Typography>
                  <Typography className="print-value">{patient.tedavi}</Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography className="print-label">Reçete</Typography>
                  <Typography className="print-value">{patient.recete}</Typography>
                </Box>
              </Box>

              {/* Tabs Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="hasta detayları ve geçmiş">
                  <Tab label="Hasta Bilgileri" icon={<PetsIcon />} />
                  <Tab label="Değişiklik Geçmişi" icon={<HistoryIcon />} />
                </Tabs>
              </Box>

              {/* Tab Panel 1: Hasta Bilgileri */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                {/* Hasta Bilgileri */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ 
                    color: '#3B82F6',
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
                    color: '#3B82F6',
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
                {/* Hemogram Parametreleri - Accordion */}
                <Grid item xs={12}>
                  <Accordion className="patient-detail-accordion" sx={{ mt: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="hemogram-content"
                      id="hemogram-header"
                    >
                      <Typography variant="h6" sx={{ 
                        color: '#3B82F6',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 600
                      }}>
                        🔬 Hemogram Parametreleri
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                
                {patient.hemogram && Object.entries(hemogramParameters).map(([key]) => {
                  const value = patient.hemogram[key];
                  if (!value) return null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <ParameterInput
                        parameter={key}
                        parameterType="hemogram"
                        value={value}
                        onChange={() => {}} // Read-only mode
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  );
                })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                {/* Biyokimya Parametreleri - Accordion */}
                <Grid item xs={12}>
                  <Accordion className="patient-detail-accordion" sx={{ mt: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="biyokimya-content"
                      id="biyokimya-header"
                    >
                      <Typography variant="h6" sx={{ 
                        color: '#3B82F6',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 600
                      }}>
                        ⚗️ Biyokimya Parametreleri
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                
                {patient.biyokimya && Object.entries(biyokimyaParameters).map(([key]) => {
                  const value = patient.biyokimya[key];
                  if (!value) return null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <ParameterInput
                        parameter={key}
                        parameterType="biyokimya"
                        value={value}
                        onChange={() => {}} // Read-only mode
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  );
                })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
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
                    color: '#3B82F6',
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
              )}

              {/* Tab Panel 2: Değişiklik Geçmişi */}
              {tabValue === 1 && (
                <Box>
                  {historyLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>Geçmiş kayıtlar yükleniyor...</Typography>
                    </Box>
                  ) : historyError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {historyError}
                    </Alert>
                  ) : history.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Bu hasta için henüz değişiklik geçmişi bulunmuyor.
                    </Alert>
                  ) : (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, color: '#2c3e50' }}>
                        Toplam {history.length} değişiklik kaydı
                      </Typography>
                      
                      {history.map((record, index) => (
                        <Accordion key={index} className="patient-detail-accordion">
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Chip 
                                label={`Versiyon ${record.version}`} 
                                color="primary" 
                                size="small" 
                                sx={{ mr: 2 }}
                              />
                              <Typography sx={{ mr: 2 }}>
                                {new Date(record.changeDate).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              <Typography color="text.secondary">
                                {record.changeReason}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={3}>
                              {/* Hasta Bilgileri Bölümü */}
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                                  Hasta Bilgileri
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Protokol No
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.protokolNo || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Hasta Adı
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.hastaAdi || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Hasta Sahibi
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.hastaSahibi || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Tür
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.tur || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Irk
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.irk || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Cinsiyet
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.cinsiyet || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Yaş
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.yas ? `${record.previousData.yas} yaş` : '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Kilo
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.kilo ? `${record.previousData.kilo} kg` : '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  VKS
                                </Typography>
                                <Typography variant="body2">
                                  {record.previousData.vks || '-'}
                                </Typography>
                              </Grid>

                              {/* Klinik Bilgileri Bölümü */}
                              <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                                  Klinik Bilgileri
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Anamnez
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.anamnez || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Radyolojik Bulgular
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.radyolojikBulgular || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Ultrasonografik Bulgular
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.ultrasonografikBulgular || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Tomografi Bulgular
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.tomografiBulgular || '-'}
                                </Typography>
                              </Grid>

                              {/* Patoloji Bilgileri Bölümü */}
                              <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                                  Patoloji Bilgileri
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Patoloji
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.patoloji || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Mikroskopisi
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.mikroskopisi || '-'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Patolojik Teşhis
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.patolojikTeshis || '-'}
                                </Typography>
                              </Grid>

                              {/* Tedavi ve Laboratuvar Bölümü */}
                              <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                                  Tedavi ve Laboratuvar
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Tedavi
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.tedavi || '-'}
                                </Typography>
                              </Grid>
                              
                              {/* Hemogram Parametreleri - History */}
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ 
                                  color: '#3B82F6',
                                  mt: 2,
                                  mb: 2,
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}>
                                  Hemogram Parametreleri (Önceki Değerler)
                                </Typography>
                              </Grid>
                              
                              {record.previousData.hemogram && typeof record.previousData.hemogram === 'object' ? 
                                Object.entries(record.previousData.hemogram).map(([key, value]) => {
                                  if (!value) return null;
                                  return (
                                    <Grid item xs={12} sm={6} md={3} key={`history-hemogram-${key}`}>
                                      <ParameterInput
                                        parameter={key}
                                        parameterType="hemogram"
                                        value={value}
                                        onChange={() => {}} // Read-only mode
                                        size="small"
                                        InputProps={{ readOnly: true }}
                                      />
                                    </Grid>
                                  );
                                })
                                :
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">
                                    {record.previousData.hemogram || 'Hemogram verisi yok'}
                                  </Typography>
                                </Grid>
                              }

                              {/* Biyokimya Parametreleri - History */}
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ 
                                  color: '#3B82F6',
                                  mt: 3,
                                  mb: 2,
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}>
                                  Biyokimya Parametreleri (Önceki Değerler)
                                </Typography>
                              </Grid>
                              
                              {record.previousData.biyokimya && typeof record.previousData.biyokimya === 'object' ? 
                                Object.entries(record.previousData.biyokimya).map(([key, value]) => {
                                  if (!value) return null;
                                  return (
                                    <Grid item xs={12} sm={6} md={3} key={`history-biyokimya-${key}`}>
                                      <ParameterInput
                                        parameter={key}
                                        parameterType="biyokimya"
                                        value={value}
                                        onChange={() => {}} // Read-only mode
                                        size="small"
                                        InputProps={{ readOnly: true }}
                                      />
                                    </Grid>
                                  );
                                })
                                :
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">
                                    {record.previousData.biyokimya || 'Biyokimya verisi yok'}
                                  </Typography>
                                </Grid>
                              }

                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Reçete
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.recete || '-'}
                                </Typography>
                              </Grid>

                              {/* Biyopsi Bilgileri Bölümü */}
                              <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                                  Biyopsi Bilgileri
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Biyopsi Türü
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  {record.previousData.biyopsi?.iiab && (
                                    <Chip 
                                      label="İİAB (ince iğne aspirasyon biyopsisi)" 
                                      color="primary" 
                                      variant="outlined" 
                                      size="small"
                                      sx={{ m: 0.5 }}
                                    />
                                  )}
                                  {record.previousData.biyopsi?.tuse && (
                                    <Chip 
                                      label="Tuşe" 
                                      color="primary" 
                                      variant="outlined" 
                                      size="small"
                                      sx={{ m: 0.5 }}
                                    />
                                  )}
                                  {record.previousData.biyopsi?.trucat && (
                                    <Chip 
                                      label="Trucat Biyopsi" 
                                      color="primary" 
                                      variant="outlined" 
                                      size="small"
                                      sx={{ m: 0.5 }}
                                    />
                                  )}
                                  {record.previousData.biyopsi?.operasyon && (
                                    <Chip 
                                      label="Operasyon" 
                                      color="primary" 
                                      variant="outlined" 
                                      size="small"
                                      sx={{ m: 0.5 }}
                                    />
                                  )}
                                  {!record.previousData.biyopsi?.iiab && 
                                   !record.previousData.biyopsi?.tuse && 
                                   !record.previousData.biyopsi?.trucat && 
                                   !record.previousData.biyopsi?.operasyon && (
                                    <Typography variant="body2" color="text.secondary">
                                      Biyopsi yapılmadı
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Biyopsi Notları
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.previousData.biyopsiNot || '-'}
                                </Typography>
                              </Grid>

                              {/* Değişiklik Bilgileri */}
                              <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ color: '#2c3e50', mb: 2 }}>
                                  Değişiklik Bilgileri
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Düzenleyen
                                </Typography>
                                <Typography variant="body2">
                                  {record.modifiedBy}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Değişiklik Tarihi
                                </Typography>
                                <Typography variant="body2">
                                  {new Date(record.changeDate).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Versiyon
                                </Typography>
                                <Typography variant="body2">
                                  {record.version}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Değişiklik Nedeni
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {record.changeReason}
                                </Typography>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              Hasta bulunamadı.
            </Alert>
          )}
        </Paper>
      </Container>
      
      {/* AI Analiz Bölümü */}
      <AIAnalysis patientId={id} />
    </div>
  );
};

export default PatientDetail; 