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
  Collapse,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShareIcon from '@mui/icons-material/Share';
import ConsultationDialog from './ConsultationDialog';
import ParameterInput from './ParameterInput';
import AIAnalysis from './AIAnalysis';
import { isValueInRange, getReferenceRangeText } from '../config/referenceRanges';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

// Styled components for modern Facebook-like design
const StyledContainer = styled(Container)({
  paddingTop: '80px',
  paddingBottom: '32px',
  '@media (max-width: 600px)': {
    paddingTop: '64px',
    paddingLeft: '16px',
    paddingRight: '16px',
  },
});

const StyledPaper = styled(Paper)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #dddfe2',
  overflow: 'hidden',
  '@media (max-width: 600px)': {
    borderRadius: '8px',
    margin: '8px',
  },
});

const HeaderSection = styled(Box)({
  background: 'linear-gradient(135deg, #1877f2 0%, #3b82f6 100%)',
  color: '#ffffff',
  padding: '32px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
  '@media (max-width: 600px)': {
    padding: '24px',
  },
});

const HeaderContent = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
  gap: '16px',
  '@media (max-width: 600px)': {
    flexDirection: 'column',
  },
});

const HeaderTitle = styled(Typography)({
  fontSize: '2.5rem',
  fontWeight: 700,
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '@media (max-width: 600px)': {
    fontSize: '2rem',
    textAlign: 'center',
  },
  '@media (max-width: 480px)': {
    fontSize: '1.75rem',
  },
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '16px',
  flexDirection: 'row',
  width: 'auto',
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    width: '100%',
  },
});

const StyledButton = styled(Button)(({ variant }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  padding: '12px 24px',
  minHeight: '44px',
  boxShadow: variant === 'contained' ? '0 2px 8px rgba(24, 119, 242, 0.3)' : 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: variant === 'contained' ? '0 4px 12px rgba(24, 119, 242, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
  },
  '@media (max-width: 600px)': {
    width: '100%',
  },
}));

const ContentSection = styled(Box)({
  padding: '32px',
  '@media (max-width: 600px)': {
    padding: '24px',
  },
});

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#1877f2',
    height: '3px',
    borderRadius: '2px',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minHeight: '48px',
    color: '#65676b',
    '&.Mui-selected': {
      color: '#1877f2',
    },
    '&:hover': {
      backgroundColor: 'rgba(24, 119, 242, 0.04)',
    },
  },
});

const SectionTitle = styled(Typography)({
  color: '#1877f2',
  fontWeight: 700,
  fontSize: '1.25rem',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '2px solid #e4e6ea',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    width: '40px',
    height: '2px',
    backgroundColor: '#1877f2',
  },
  '@media (max-width: 600px)': {
    fontSize: '1.1rem',
  },
});

const InfoCard = styled(Card)({
  backgroundColor: '#f8f9fa',
  border: '1px solid #e4e6ea',
  borderRadius: '8px',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transform: 'translateY(-1px)',
  },
});

const InfoCardContent = styled(CardContent)({
  padding: '16px',
  '&:last-child': {
    paddingBottom: '16px',
  },
});

const LabelText = styled(Typography)({
  color: '#65676b',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const ValueText = styled(Typography)({
  color: '#1c1e21',
  fontSize: '1rem',
  fontWeight: 500,
  lineHeight: 1.4,
});

const StyledAccordion = styled(Accordion)({
  backgroundColor: '#ffffff',
  border: '1px solid #e4e6ea',
  borderRadius: '8px',
  boxShadow: 'none',
  marginBottom: '16px',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#e4e6ea',
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: '24px',
    backgroundColor: '#ffffff',
  },
});

const HistoryChip = styled(Chip)({
  backgroundColor: '#e7f3ff',
  color: '#1877f2',
  fontWeight: 600,
  fontSize: '0.8rem',
  height: '24px',
});

const PatientDetail = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [consultationDialog, setConsultationDialog] = useState(false);
  const [hemogramCollapsed, setHemogramCollapsed] = useState(true);
  const [biyokimyaCollapsed, setBiyokimyaCollapsed] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    fetchPatientDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Hasta bilgileri yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setPatient(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchPatientHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = await fetch(`${API_URL}/api/patients/${id}/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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

  // Değerin referans aralığında olup olmadığını kontrol eden fonksiyon
  const getValueColor = (value, parameter, parameterType) => {
    if (patient?.tur !== 'Kedi' || !value || value === '') return 'inherit';
    
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
        cursor: 'pointer',
        p: 1.5,
        borderRadius: 2,
        backgroundColor: hemogramCollapsed ? '#e3f2fd' : '#1976d2',
        color: hemogramCollapsed ? '#1976d2' : '#ffffff',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: hemogramCollapsed ? '#bbdefb' : '#1565c0',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
        }
      }}
      onClick={() => setHemogramCollapsed(!hemogramCollapsed)}
      >
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '1rem'
        }}>
          🩸 Hemogram Parametreleri
          {!hemogramCollapsed && <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>(Gizlemek için tıklayın)</Typography>}
          {hemogramCollapsed && <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>(Göstermek için tıklayın)</Typography>}
        </Typography>
        <IconButton size="small" sx={{ color: 'inherit' }}>
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
              <Box sx={{ 
                p: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {param}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: getValueColor(patient?.hemogram?.[param], param, 'hemogram'),
                  fontWeight: patient?.tur === 'Kedi' ? 500 : 400,
                  fontSize: '0.9rem'
                }}>
                  {patient?.hemogram?.[param] || '-'}
                </Typography>
                {patient?.tur === 'Kedi' && patient?.hemogram?.[param] && (
                  <Typography variant="caption" sx={{ 
                    color: getValueColor(patient?.hemogram?.[param], param, 'hemogram'),
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {getReferenceRangeText(param, 'hemogram')}
                  </Typography>
                )}
              </Box>
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
              <Box sx={{ 
                p: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {param}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: getValueColor(patient?.hemogram?.[param], param, 'hemogram'),
                  fontWeight: patient?.tur === 'Kedi' ? 500 : 400,
                  fontSize: '0.9rem'
                }}>
                  {patient?.hemogram?.[param] || '-'}
                </Typography>
                {patient?.tur === 'Kedi' && patient?.hemogram?.[param] && (
                  <Typography variant="caption" sx={{ 
                    color: getValueColor(patient?.hemogram?.[param], param, 'hemogram'),
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {getReferenceRangeText(param, 'hemogram')}
                  </Typography>
                )}
              </Box>
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
              <Box sx={{ 
                p: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {param}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: getValueColor(patient?.hemogram?.[param], param, 'hemogram'),
                  fontWeight: patient?.tur === 'Kedi' ? 500 : 400,
                  fontSize: '0.9rem'
                }}>
                  {patient?.hemogram?.[param] || '-'}
                </Typography>
                {patient?.tur === 'Kedi' && patient?.hemogram?.[param] && (
                  <Typography variant="caption" sx={{ 
                    color: getValueColor(patient?.hemogram?.[param], param, 'hemogram'),
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {getReferenceRangeText(param, 'hemogram')}
                  </Typography>
                )}
              </Box>
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
        cursor: 'pointer',
        p: 1.5,
        borderRadius: 2,
        backgroundColor: biyokimyaCollapsed ? '#e8f5e8' : '#2e7d32',
        color: biyokimyaCollapsed ? '#2e7d32' : '#ffffff',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: biyokimyaCollapsed ? '#c8e6c8' : '#1b5e20',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)'
        }
      }}
      onClick={() => setBiyokimyaCollapsed(!biyokimyaCollapsed)}
      >
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '1rem'
        }}>
          🧪 Biyokimya Parametreleri
          {!biyokimyaCollapsed && <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>(Gizlemek için tıklayın)</Typography>}
          {biyokimyaCollapsed && <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>(Göstermek için tıklayın)</Typography>}
        </Typography>
        <IconButton size="small" sx={{ color: 'inherit' }}>
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
              <Box sx={{ 
                p: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {param}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: getValueColor(patient?.biyokimya?.[param], param, 'biyokimya'),
                  fontWeight: patient?.tur === 'Kedi' ? 500 : 400,
                  fontSize: '0.9rem'
                }}>
                  {patient?.biyokimya?.[param] || '-'}
                </Typography>
                {patient?.tur === 'Kedi' && patient?.biyokimya?.[param] && (
                  <Typography variant="caption" sx={{ 
                    color: getValueColor(patient?.biyokimya?.[param], param, 'biyokimya'),
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {getReferenceRangeText(param, 'biyokimya')}
                  </Typography>
                )}
              </Box>
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
              <Box sx={{ 
                p: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {param}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: getValueColor(patient?.biyokimya?.[param], param, 'biyokimya'),
                  fontWeight: patient?.tur === 'Kedi' ? 500 : 400,
                  fontSize: '0.9rem'
                }}>
                  {patient?.biyokimya?.[param] || '-'}
                </Typography>
                {patient?.tur === 'Kedi' && patient?.biyokimya?.[param] && (
                  <Typography variant="caption" sx={{ 
                    color: getValueColor(patient?.biyokimya?.[param], param, 'biyokimya'),
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {getReferenceRangeText(param, 'biyokimya')}
                  </Typography>
                )}
              </Box>
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
              <Box sx={{ 
                p: 1, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                backgroundColor: '#fafafa'
              }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  {param}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: getValueColor(patient?.biyokimya?.[param], param, 'biyokimya'),
                  fontWeight: patient?.tur === 'Kedi' ? 500 : 400,
                  fontSize: '0.9rem'
                }}>
                  {patient?.biyokimya?.[param] || '-'}
                </Typography>
                {patient?.tur === 'Kedi' && patient?.biyokimya?.[param] && (
                  <Typography variant="caption" sx={{ 
                    color: getValueColor(patient?.biyokimya?.[param], param, 'biyokimya'),
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {getReferenceRangeText(param, 'biyokimya')}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Paper>
  );

  if (loading) {
    return (
      <StyledContainer maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#1877f2' }} />
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4, borderRadius: '8px' }}>
          {error}
        </Alert>
      </StyledContainer>
    );
  }

  if (!patient) {
    return (
      <StyledContainer maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4, borderRadius: '8px' }}>
          Hasta bulunamadı.
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <div className="patient-detail-wrapper fade-in">
      <StyledContainer maxWidth="xl">
        <StyledPaper elevation={0}>
          {/* Header Section */}
          <HeaderSection>
            <HeaderContent>
              <Box>
                <HeaderTitle variant="h1">
                  {patient.hastaAdi}
                </HeaderTitle>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                  Protokol No: {patient.protokolNo} • {patient.tur} • {patient.cinsiyet}
                </Typography>
              </Box>
              <ActionButtons>
                <StyledButton
                  variant="outlined"
                  onClick={() => navigate('/hastalar')}
                  sx={{ 
                    color: '#ffffff', 
                    borderColor: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  <ArrowBackIcon sx={{ mr: 1 }} />
                  Geri Dön
                </StyledButton>
                <StyledButton
                  variant="outlined"
                  onClick={handlePrint}
                  startIcon={<PrintIcon />}
                  sx={{ 
                    color: '#ffffff', 
                    borderColor: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Yazdır
                </StyledButton>
                <StyledButton
                  variant="contained"
                  onClick={() => navigate(`/hasta-duzenle/${id}`)}
                  startIcon={<EditIcon />}
                  sx={{ 
                    backgroundColor: '#ffffff',
                    color: '#1877f2',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                    }
                  }}
                >
                  Düzenle
                </StyledButton>
                <StyledButton
                  variant="outlined"
                  onClick={() => setConsultationDialog(true)}
                  startIcon={<ShareIcon />}
                  sx={{ 
                    color: '#ffffff', 
                    borderColor: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Konsültasyon
                </StyledButton>
              </ActionButtons>
            </HeaderContent>
          </HeaderSection>

          {/* Content Section */}
          <ContentSection>
            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: '#e4e6ea', mb: 4 }}>
              <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="hasta detayları ve geçmiş">
                <Tab label="Hasta Bilgileri" icon={<PetsIcon />} />
                <Tab label="Değişiklik Geçmişi" icon={<HistoryIcon />} />
              </StyledTabs>
            </Box>

            {/* Tab Panel 1: Hasta Bilgileri */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {/* Sol Panel - Biyokimya */}
                <Grid item xs={12} lg={3} md={4}>
                  {renderBiyokimyaPanel()}
                </Grid>

                {/* Orta Panel - Ana Form */}
                <Grid item xs={12} lg={6} md={8}>
                  <Grid container spacing={2}>
                    {/* Hasta Bilgileri */}
                    <Grid item xs={12}>
                      <SectionTitle variant="h6">
                        Hasta Bilgileri
                      </SectionTitle>
                    </Grid>
                    
                    {/* Basic Info Cards */}
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Protokol No</LabelText>
                          <ValueText variant="body1">{patient.protokolNo}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Hasta Adı</LabelText>
                          <ValueText variant="body1">{patient.hastaAdi}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Hasta Sahibi</LabelText>
                          <ValueText variant="body1">{patient.hastaSahibi}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Tür</LabelText>
                          <ValueText variant="body1">{patient.tur}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Irk</LabelText>
                          <ValueText variant="body1">{patient.irk}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Cinsiyet</LabelText>
                          <ValueText variant="body1">{patient.cinsiyet}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Yaş</LabelText>
                          <ValueText variant="body1">{patient.yas} yaş</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Kilo</LabelText>
                          <ValueText variant="body1">{patient.kilo} kg</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">VKS</LabelText>
                          <ValueText variant="body1">{patient.vks}</ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>

                    {/* Klinik Bilgileri */}
                    <Grid item xs={12}>
                      <SectionTitle variant="h6" sx={{ mt: 4 }}>
                        Klinik Bilgileri
                      </SectionTitle>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Anamnez</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.anamnez || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Radyolojik Bulgular</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.radyolojikBulgular || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Ultrasonografik Bulgular</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.ultrasonografikBulgular || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Tomografi Bulgular</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.tomografiBulgular || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>

                    {/* Patoloji Bilgileri */}
                    <Grid item xs={12}>
                      <SectionTitle variant="h6" sx={{ mt: 4 }}>
                        Patoloji Bilgileri
                      </SectionTitle>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Patoloji</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.patoloji || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Mikroskopisi</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.mikroskopisi || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Patolojik Teşhis</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.patolojikTeshis || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>

                    {/* Tedavi ve Reçete */}
                    <Grid item xs={12}>
                      <SectionTitle variant="h6" sx={{ mt: 4 }}>
                        Tedavi ve Reçete
                      </SectionTitle>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Tedavi</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.tedavi || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Reçete</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.recete || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>

                    {/* Biyopsi Bilgileri */}
                    <Grid item xs={12}>
                      <SectionTitle variant="h6" sx={{ mt: 4 }}>
                        Biyopsi Bilgileri
                      </SectionTitle>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Biyopsi Türü</LabelText>
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
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <InfoCard>
                        <InfoCardContent>
                          <LabelText variant="subtitle2">Biyopsi Notları</LabelText>
                          <ValueText variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {patient.biyopsiNot || 'Belirtilmemiş'}
                          </ValueText>
                        </InfoCardContent>
                      </InfoCard>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Sağ Panel - Hemogram */}
                <Grid item xs={12} lg={3} md={12}>
                  {renderHemogramPanel()}
                </Grid>
              </Grid>
            )}

            {/* Tab Panel 2: Değişiklik Geçmişi */}
            {tabValue === 1 && (
              <Box>
                {historyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
                    <CircularProgress size={40} sx={{ color: '#1877f2', mr: 2 }} />
                    <Typography>Geçmiş kayıtlar yükleniyor...</Typography>
                  </Box>
                ) : historyError ? (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                    {historyError}
                  </Alert>
                ) : history.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
                    Bu hasta için henüz değişiklik geçmişi bulunmuyor.
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: '#1877f2', fontWeight: 600 }}>
                      Toplam {history.length} değişiklik kaydı
                    </Typography>
                    
                    {history.map((record, index) => (
                      <StyledAccordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 2 }}>
                            <HistoryChip 
                              label={`Versiyon ${record.version}`} 
                              size="small" 
                            />
                            <Typography sx={{ fontWeight: 500 }}>
                              {new Date(record.changeDate).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                            <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                              {record.changeReason}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={3}>
                            {/* Hasta Bilgileri Bölümü */}
                            <Grid item xs={12}>
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Hasta Bilgileri
                              </SectionTitle>
                            </Grid>
                            
                            {/* Basic Info Grid */}
                            {[
                              { label: 'Protokol No', value: record.previousData.protokolNo },
                              { label: 'Hasta Adı', value: record.previousData.hastaAdi },
                              { label: 'Hasta Sahibi', value: record.previousData.hastaSahibi },
                              { label: 'Tür', value: record.previousData.tur },
                              { label: 'Irk', value: record.previousData.irk },
                              { label: 'Cinsiyet', value: record.previousData.cinsiyet },
                              { label: 'Yaş', value: record.previousData.yas ? `${record.previousData.yas} yaş` : '-' },
                              { label: 'Kilo', value: record.previousData.kilo ? `${record.previousData.kilo} kg` : '-' },
                              { label: 'VKS', value: record.previousData.vks }
                            ].map((item, idx) => (
                              <Grid item xs={12} sm={6} md={4} key={idx}>
                                <InfoCard>
                                  <InfoCardContent>
                                    <LabelText variant="subtitle2">{item.label}</LabelText>
                                    <ValueText variant="body2">{item.value || '-'}</ValueText>
                                  </InfoCardContent>
                                </InfoCard>
                              </Grid>
                            ))}

                            {/* Klinik Bilgileri Bölümü */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Klinik Bilgileri
                              </SectionTitle>
                            </Grid>
                            
                            {[
                              { label: 'Anamnez', value: record.previousData.anamnez, fullWidth: true },
                              { label: 'Radyolojik Bulgular', value: record.previousData.radyolojikBulgular },
                              { label: 'Ultrasonografik Bulgular', value: record.previousData.ultrasonografikBulgular },
                              { label: 'Tomografi Bulgular', value: record.previousData.tomografiBulgular, fullWidth: true }
                            ].map((item, idx) => (
                              <Grid item xs={12} sm={item.fullWidth ? 12 : 6} key={idx}>
                                <InfoCard>
                                  <InfoCardContent>
                                    <LabelText variant="subtitle2">{item.label}</LabelText>
                                    <ValueText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {item.value || '-'}
                                    </ValueText>
                                  </InfoCardContent>
                                </InfoCard>
                              </Grid>
                            ))}

                            {/* Patoloji Bilgileri Bölümü */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Patoloji Bilgileri
                              </SectionTitle>
                            </Grid>
                            
                            {[
                              { label: 'Patoloji', value: record.previousData.patoloji },
                              { label: 'Mikroskopisi', value: record.previousData.mikroskopisi },
                              { label: 'Patolojik Teşhis', value: record.previousData.patolojikTeshis, fullWidth: true }
                            ].map((item, idx) => (
                              <Grid item xs={12} sm={item.fullWidth ? 12 : 6} key={idx}>
                                <InfoCard>
                                  <InfoCardContent>
                                    <LabelText variant="subtitle2">{item.label}</LabelText>
                                    <ValueText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {item.value || '-'}
                                    </ValueText>
                                  </InfoCardContent>
                                </InfoCard>
                              </Grid>
                            ))}

                            {/* Hemogram Parametreleri - History */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Hemogram Parametreleri (Önceki Değerler)
                              </SectionTitle>
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
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Biyokimya Parametreleri (Önceki Değerler)
                              </SectionTitle>
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

                            {/* Tedavi ve Reçete */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Tedavi ve Reçete
                              </SectionTitle>
                            </Grid>
                            
                            {[
                              { label: 'Tedavi', value: record.previousData.tedavi, fullWidth: true },
                              { label: 'Reçete', value: record.previousData.recete, fullWidth: true }
                            ].map((item, idx) => (
                              <Grid item xs={12} key={idx}>
                                <InfoCard>
                                  <InfoCardContent>
                                    <LabelText variant="subtitle2">{item.label}</LabelText>
                                    <ValueText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {item.value || '-'}
                                    </ValueText>
                                  </InfoCardContent>
                                </InfoCard>
                              </Grid>
                            ))}

                            {/* Biyopsi Bilgileri Bölümü */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Biyopsi Bilgileri
                              </SectionTitle>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <InfoCard>
                                <InfoCardContent>
                                  <LabelText variant="subtitle2">Biyopsi Türü</LabelText>
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
                                </InfoCardContent>
                              </InfoCard>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <InfoCard>
                                <InfoCardContent>
                                  <LabelText variant="subtitle2">Biyopsi Notları</LabelText>
                                  <ValueText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {record.previousData.biyopsiNot || '-'}
                                  </ValueText>
                                </InfoCardContent>
                              </InfoCard>
                            </Grid>

                            {/* Değişiklik Bilgileri */}
                            <Grid item xs={12}>
                              <Divider sx={{ my: 3 }} />
                              <SectionTitle variant="h6" sx={{ fontSize: '1.1rem' }}>
                                Değişiklik Bilgileri
                              </SectionTitle>
                            </Grid>
                            
                            {[
                              { label: 'Düzenleyen', value: record.modifiedBy },
                              { label: 'Değişiklik Tarihi', value: new Date(record.changeDate).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })},
                              { label: 'Versiyon', value: record.version }
                            ].map((item, idx) => (
                              <Grid item xs={12} sm={6} md={4} key={idx}>
                                <InfoCard>
                                  <InfoCardContent>
                                    <LabelText variant="subtitle2">{item.label}</LabelText>
                                    <ValueText variant="body2">{item.value}</ValueText>
                                  </InfoCardContent>
                                </InfoCard>
                              </Grid>
                            ))}
                            
                            <Grid item xs={12}>
                              <InfoCard>
                                <InfoCardContent>
                                  <LabelText variant="subtitle2">Değişiklik Nedeni</LabelText>
                                  <ValueText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {record.changeReason}
                                  </ValueText>
                                </InfoCardContent>
                              </InfoCard>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </StyledAccordion>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </ContentSection>
        </StyledPaper>
      </StyledContainer>
      
      {/* AI Analiz Bölümü */}
      <AIAnalysis patientId={id} />

      {/* Konsültasyon Dialog'u */}
      <ConsultationDialog
        open={consultationDialog}
        onClose={() => setConsultationDialog(false)}
        patient={patient}
      />
    </div>
  );
};

export default PatientDetail; 