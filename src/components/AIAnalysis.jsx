import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Fade,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScienceIcon from '@mui/icons-material/Science';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

// Styled components for modern Facebook-like design
const AIAnalysisContainer = styled(Box)({
  position: 'relative',
  maxWidth: '320px',
  width: '320px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 1,
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
  '@media (max-width: 1200px)': {
    maxWidth: '280px',
    width: '280px',
  },
  '@media (max-width: 900px)': {
    maxWidth: '260px',
    width: '260px'
  },
  '@media (max-width: 600px)': {
    maxWidth: '240px',
    width: '240px'
  }
});

const AIAnalysisPaper = styled(Paper)({
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 30px rgba(24, 119, 242, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.5)'
  }
});

const AIHeader = styled(Box)({
  background: 'linear-gradient(135deg, #1877f2 0%, #3b82f6 100%)',
  color: '#ffffff',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.2,
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #166fe5 0%, #2563eb 100%)'
  }
});

const AIHeaderContent = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
});

const AIHeaderTitle = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 700,
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const AIHeaderActions = styled(Box)({
  position: 'relative',
  zIndex: 1,
});

const AIButton = styled(Button)(({ variant, color }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '6px 12px',
  minHeight: '32px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid transparent',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
  ...(variant === 'contained' && {
    background: color === 'primary' ? 'linear-gradient(135deg, #1877f2 0%, #3b82f6 100%)' :
               color === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
               'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    '&:hover': {
      background: color === 'primary' ? 'linear-gradient(135deg, #166fe5 0%, #2563eb 100%)' :
                 color === 'success' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
    }
  }),
  ...(variant === 'outlined' && {
    border: '2px solid #e4e6ea',
    color: '#65676b',
    backgroundColor: '#ffffff',
    '&:hover': {
      borderColor: '#1877f2',
      backgroundColor: 'rgba(24, 119, 242, 0.04)',
    }
  })
}));

const AIAccordion = styled(Accordion)({
  backgroundColor: '#ffffff',
  border: '1px solid #e4e6ea',
  borderRadius: '8px',
  boxShadow: 'none',
  marginBottom: '12px',
  overflow: 'hidden',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px 16px',
    '&:hover': {
      backgroundColor: '#e4e6ea',
    },
    '& .MuiAccordionSummary-content': {
      margin: 0,
    }
  },
  '& .MuiAccordionDetails-root': {
    padding: '16px',
    backgroundColor: '#ffffff',
  },
});

const AnalysisSection = styled(Box)({
  marginBottom: '16px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const SectionTitle = styled(Typography)(({ color = '#1877f2' }) => ({
  fontWeight: 700,
  fontSize: '0.85rem',
  marginBottom: '8px',
  color: color,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}));

const AnalysisCard = styled(Box)(({ color = '#1877f2' }) => ({
  padding: '12px',
  backgroundColor: `rgba(${color === '#1877f2' ? '24, 119, 242' : 
                           color === '#10b981' ? '16, 185, 129' : 
                           color === '#ef4444' ? '239, 68, 68' : 
                           color === '#8b5cf6' ? '139, 92, 246' : 
                           color === '#f59e0b' ? '245, 158, 11' : '99, 102, 241'}, 0.04)`,
  border: `1px solid rgba(${color === '#1877f2' ? '24, 119, 242' : 
                           color === '#10b981' ? '16, 185, 129' : 
                           color === '#ef4444' ? '239, 68, 68' : 
                           color === '#8b5cf6' ? '139, 92, 246' : 
                           color === '#f59e0b' ? '245, 158, 11' : '99, 102, 241'}, 0.1)`,
  borderRadius: '6px',
  marginBottom: '8px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: `rgba(${color === '#1877f2' ? '24, 119, 242' : 
                             color === '#10b981' ? '16, 185, 129' : 
                             color === '#ef4444' ? '239, 68, 68' : 
                             color === '#8b5cf6' ? '139, 92, 246' : 
                             color === '#f59e0b' ? '245, 158, 11' : '99, 102, 241'}, 0.08)`,
    transform: 'translateY(-1px)',
  },
  '&:last-child': {
    marginBottom: 0,
  },
}));

const PriorityChip = styled(Chip)(({ priority }) => ({
  backgroundColor: priority === 'yüksek' ? '#fef2f2' : 
                  priority === 'orta' ? '#fffbeb' : '#f0fdf4',
  color: priority === 'yüksek' ? '#dc2626' : 
         priority === 'orta' ? '#d97706' : '#059669',
  border: `1px solid ${priority === 'yüksek' ? '#fecaca' : 
                       priority === 'orta' ? '#fed7aa' : '#bbf7d0'}`,
  fontSize: '0.75rem',
  height: '20px',
  fontWeight: 600,
}));

const PrognosisChip = styled(Chip)(({ prognosis }) => ({
  backgroundColor: prognosis === 'iyi' ? '#f0fdf4' : 
                  prognosis === 'orta' ? '#fffbeb' : '#fef2f2',
  color: prognosis === 'iyi' ? '#059669' : 
         prognosis === 'orta' ? '#d97706' : '#dc2626',
  border: `1px solid ${prognosis === 'iyi' ? '#bbf7d0' : 
                       prognosis === 'orta' ? '#fed7aa' : '#fecaca'}`,
  fontSize: '0.75rem',
  height: '20px',
  fontWeight: 600,
}));

const AIAnalysis = ({ patientId }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [treatmentSuggestions, setTreatmentSuggestions] = useState(null);
  const [labAnalysis, setLabAnalysis] = useState(null);
  const [minimized, setMinimized] = useState(true);

  const handleError = async (error, response) => {
    console.error('AI işlemi hatası:', error);
    let errorMessage = '';
    
    try {
      if (response) {
        const errorData = await response.json();
        if (errorData.details && errorData.details.includes('kota')) {
          errorMessage = 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
        } else {
          errorMessage = errorData.message || 'Sunucu hatası.';
        }
      } else if (error.message.includes('API key')) {
        errorMessage = 'AI servisi yapılandırma hatası.';
      } else if (!navigator.onLine) {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
      } else {
        errorMessage = error.message;
      }
    } catch (e) {
      errorMessage = 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    }
    
    setError(errorMessage);
  };

  const generateAnalysis = async () => {
    if (!token) {
      setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/patients/${patientId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Sunucu yanıtı başarısız', { cause: response });
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setMinimized(false);
    } catch (err) {
      handleError(err, err.cause);
    } finally {
      setLoading(false);
    }
  };

  const generateTreatmentSuggestions = async () => {
    if (!token) {
      setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/patients/${patientId}/treatment-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Sunucu yanıtı başarısız', { cause: response });
      }
      
      const data = await response.json();
      setTreatmentSuggestions(data.suggestions);
      setMinimized(false);
    } catch (err) {
      handleError(err, err.cause);
    } finally {
      setLoading(false);
    }
  };

  const generateLabAnalysis = async () => {
    if (!token) {
      setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/patients/${patientId}/analyze-lab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Sunucu yanıtı başarısız', { cause: response });
      }
      
      const data = await response.json();
      setLabAnalysis(data.labAnalysis);
      setMinimized(false);
    } catch (err) {
      handleError(err, err.cause);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIAnalysisContainer>
      <Fade in={true}>
        <AIAnalysisPaper
          elevation={0}
          onClick={() => setMinimized(false)}
        >
                     <AIHeader onClick={() => setMinimized(false)}>
             <AIHeaderContent>
               <Box sx={{ 
                 fontSize: '1.5rem', 
                 display: 'flex', 
                 alignItems: 'center',
                 animation: 'pulse 2s infinite'
               }}>
                 🤖
               </Box>
               <AIHeaderTitle variant="h6">
                 AI Klinik Asistan
               </AIHeaderTitle>
             </AIHeaderContent>
            <AIHeaderActions>
              <Tooltip title={minimized ? "Genişlet" : "Küçült"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized(!minimized);
                  }}
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {minimized ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Tooltip>
            </AIHeaderActions>
          </AIHeader>

                     <Fade in={!minimized}>
             <Box sx={{ p: 2, display: minimized ? 'none' : 'block' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                  {error}
                </Alert>
              )}

                             <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <AIButton
                  variant="contained"
                  onClick={generateAnalysis}
                  disabled={loading}
                  startIcon={<PsychologyIcon />}
                  color="primary"
                  size="small"
                >
                  Genel Analiz
                </AIButton>
                <AIButton
                  variant="contained"
                  onClick={generateTreatmentSuggestions}
                  disabled={loading}
                  startIcon={<MedicalServicesIcon />}
                  color="success"
                  size="small"
                >
                  Tedavi Önerileri
                </AIButton>
                <AIButton
                  variant="contained"
                  onClick={generateLabAnalysis}
                  disabled={loading}
                  startIcon={<ScienceIcon />}
                  color="secondary"
                  size="small"
                >
                  Lab Analizi
                </AIButton>
              </Box>

                             {loading && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                  <CircularProgress size={32} sx={{ color: '#1877f2', mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    AI analizi yapılıyor...
                  </Typography>
                </Box>
              )}

                             {(analysis || treatmentSuggestions || labAnalysis) && (
                 <Box sx={{ mt: 2 }}>
                  {analysis && (
                                         <AIAccordion defaultExpanded>
                       <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#1877f2' }} />}>
                         <SectionTitle color="#1877f2">
                           <PsychologyIcon fontSize="small" />
                           Genel Analiz
                         </SectionTitle>
                       </AccordionSummary>
                       <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {analysis.error ? (
                          <Typography variant="body2" color="error">
                            {analysis.rawResponse}
                          </Typography>
                        ) : (
                          <Box>
                            {analysis.differentials && (
                              <AnalysisSection>
                                <SectionTitle color="#1877f2">
                                  🎯 Diferansiyel Tanılar
                                </SectionTitle>
                                {analysis.differentials.map((diff, index) => (
                                  <AnalysisCard key={index} color="#1877f2">
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                      {diff.dx}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      {diff.rationale}
                                    </Typography>
                                    <Chip 
                                      label={`Olasılık: ${Math.round(diff.likelihood * 100)}%`}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: 'rgba(24, 119, 242, 0.1)',
                                        color: '#1877f2',
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {analysis.tests && (
                              <AnalysisSection>
                                <SectionTitle color="#10b981">
                                  🔬 Önerilen Testler
                                </SectionTitle>
                                {analysis.tests.map((test, index) => (
                                  <AnalysisCard key={index} color="#10b981">
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                      {test.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {test.why}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {analysis.red_flags && analysis.red_flags.length > 0 && (
                              <AnalysisSection>
                                <SectionTitle color="#ef4444">
                                  ⚠️ Kırmızı Bayraklar
                                </SectionTitle>
                                {analysis.red_flags.map((flag, index) => (
                                  <AnalysisCard key={index} color="#ef4444">
                                    <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                                      • {flag}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </AIAccordion>
                  )}

                  {treatmentSuggestions && (
                                         <AIAccordion defaultExpanded>
                       <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#10b981' }} />}>
                         <SectionTitle color="#10b981">
                           <MedicalServicesIcon fontSize="small" />
                           Tedavi Önerileri
                         </SectionTitle>
                       </AccordionSummary>
                       <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {treatmentSuggestions.error ? (
                          <Typography variant="body2" color="error">
                            {treatmentSuggestions.rawResponse}
                          </Typography>
                        ) : (
                          <Box>
                            {treatmentSuggestions.treatments && (
                              <AnalysisSection>
                                <SectionTitle color="#10b981">
                                  💊 Tedavi Önerileri
                                </SectionTitle>
                                {treatmentSuggestions.treatments.map((treatment, index) => (
                                  <AnalysisCard key={index} color="#10b981">
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                                        {treatment.treatment}
                                      </Typography>
                                      <PriorityChip 
                                        label={treatment.priority} 
                                        priority={treatment.priority}
                                        size="small"
                                      />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {treatment.rationale}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {treatmentSuggestions.medications && (
                              <AnalysisSection>
                                <SectionTitle color="#8b5cf6">
                                  💊 İlaç Önerileri
                                </SectionTitle>
                                {treatmentSuggestions.medications.map((med, index) => (
                                  <AnalysisCard key={index} color="#8b5cf6">
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                      {med.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                                      <Chip 
                                        label={`Doz: ${med.dosage}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                      />
                                      <Chip 
                                        label={`Süre: ${med.duration}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                      />
                                    </Box>
                                    {med.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        Not: {med.notes}
                                      </Typography>
                                    )}
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {treatmentSuggestions.monitoring && treatmentSuggestions.monitoring.length > 0 && (
                              <AnalysisSection>
                                <SectionTitle color="#f59e0b">
                                  📊 İzleme
                                </SectionTitle>
                                {treatmentSuggestions.monitoring.map((item, index) => (
                                  <AnalysisCard key={index} color="#f59e0b">
                                    <Typography variant="body2" color="text.secondary">
                                      • {item}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {treatmentSuggestions.follow_up && (
                              <AnalysisSection>
                                <SectionTitle color="#06b6d4">
                                  📅 Takip
                                </SectionTitle>
                                <AnalysisCard color="#06b6d4">
                                  <Typography variant="body2" color="text.secondary">
                                    {treatmentSuggestions.follow_up}
                                  </Typography>
                                </AnalysisCard>
                              </AnalysisSection>
                            )}
                            
                            {treatmentSuggestions.prognosis && (
                              <AnalysisSection>
                                <SectionTitle color="#059669">
                                  🔮 Prognoz
                                </SectionTitle>
                                <AnalysisCard color="#059669">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      Tahmini Sonuç:
                                    </Typography>
                                    <PrognosisChip 
                                      label={treatmentSuggestions.prognosis === 'iyi' ? 'İyi' : 
                                             treatmentSuggestions.prognosis === 'orta' ? 'Orta' : 'Kötü'} 
                                      prognosis={treatmentSuggestions.prognosis}
                                    />
                                  </Box>
                                </AnalysisCard>
                              </AnalysisSection>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </AIAccordion>
                  )}

                  {labAnalysis && (
                                         <AIAccordion defaultExpanded>
                       <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#6366f1' }} />}>
                         <SectionTitle color="#6366f1">
                           <ScienceIcon fontSize="small" />
                           Laboratuvar Analizi
                         </SectionTitle>
                       </AccordionSummary>
                       <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {labAnalysis.error ? (
                          <Typography variant="body2" color="error">
                            {labAnalysis.rawResponse}
                          </Typography>
                        ) : (
                          <Box>
                            {labAnalysis.abnormalities && (
                              <AnalysisSection>
                                <SectionTitle color="#ef4444">
                                  ⚠️ Anormallikler
                                </SectionTitle>
                                {labAnalysis.abnormalities.map((abnormality, index) => (
                                  <AnalysisCard key={index} color="#ef4444">
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                      {abnormality.parameter}: {abnormality.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      Normal: {abnormality.reference_range}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {abnormality.significance}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {labAnalysis.interpretation && (
                              <AnalysisSection>
                                <SectionTitle color="#6366f1">
                                  📋 Yorum
                                </SectionTitle>
                                <AnalysisCard color="#6366f1">
                                  <Typography variant="body2" color="text.secondary">
                                    {labAnalysis.interpretation}
                                  </Typography>
                                </AnalysisCard>
                              </AnalysisSection>
                            )}
                            
                            {labAnalysis.recommendations && (
                              <AnalysisSection>
                                <SectionTitle color="#10b981">
                                  💡 Öneriler
                                </SectionTitle>
                                {labAnalysis.recommendations.map((rec, index) => (
                                  <AnalysisCard key={index} color="#10b981">
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                      {rec.action}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {rec.reason}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {labAnalysis.differential_diagnosis && labAnalysis.differential_diagnosis.length > 0 && (
                              <AnalysisSection>
                                <SectionTitle color="#8b5cf6">
                                  🎯 Diferansiyel Tanı
                                </SectionTitle>
                                {labAnalysis.differential_diagnosis.map((dx, index) => (
                                  <AnalysisCard key={index} color="#8b5cf6">
                                    <Typography variant="body2" color="text.secondary">
                                      • {dx}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                            
                            {labAnalysis.next_steps && labAnalysis.next_steps.length > 0 && (
                              <AnalysisSection>
                                <SectionTitle color="#f59e0b">
                                  ➡️ Sonraki Adımlar
                                </SectionTitle>
                                {labAnalysis.next_steps.map((step, index) => (
                                  <AnalysisCard key={index} color="#f59e0b">
                                    <Typography variant="body2" color="text.secondary">
                                      • {step}
                                    </Typography>
                                  </AnalysisCard>
                                ))}
                              </AnalysisSection>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </AIAccordion>
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        </AIAnalysisPaper>
      </Fade>
    </AIAnalysisContainer>
  );
};

export default AIAnalysis;