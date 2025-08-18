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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScienceIcon from '@mui/icons-material/Science';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

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
    <Box
      sx={{
        position: 'fixed',
        top: '20%',
        left: 20,
        maxWidth: minimized ? '200px' : '350px',
        width: '100%',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        opacity: 1,
        '@media (max-width: 1200px)': {
          maxWidth: minimized ? '180px' : '300px',
        },
        '@media (max-width: 900px)': {
          top: 'auto',
          bottom: 20,
          left: 20,
          maxWidth: minimized ? '160px' : '280px'
        },
        '@media (max-width: 600px)': {
          left: 10,
          maxWidth: minimized ? '140px' : '260px'
        }
      }}
    >
      <Fade in={true}>
        <Paper
          elevation={6}
          className="ai-analysis-wrapper"
          onClick={() => setMinimized(false)}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'white',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }
          }}
        >
          <Box
            className="ai-analysis-header"
            onClick={() => setMinimized(false)}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
              color: 'white',
              padding: minimized ? '12px 16px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)'
              }
            }}
          >
            <Typography 
              variant={minimized ? "body1" : "h6"} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: minimized ? '0.9rem' : 'inherit',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <PsychologyIcon sx={{ fontSize: minimized ? '1.2rem' : '1.5rem' }} /> 
              AI Analiz
            </Typography>
            <Box>
              <Tooltip title={minimized ? "Genişlet" : "Küçült"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized(!minimized);
                  }}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {minimized ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Fade in={!minimized}>
            <Box sx={{ p: 2, display: minimized ? 'none' : 'block' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={generateAnalysis}
                  disabled={loading}
                  startIcon={<PsychologyIcon />}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    }
                  }}
                >
                  Genel Analiz
                </Button>
                <Button
                  variant="contained"
                  onClick={generateTreatmentSuggestions}
                  disabled={loading}
                  startIcon={<MedicalServicesIcon />}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    }
                  }}
                >
                  Tedavi Önerileri
                </Button>
                <Button
                  variant="contained"
                  onClick={generateLabAnalysis}
                  disabled={loading}
                  startIcon={<ScienceIcon />}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                    }
                  }}
                >
                  Lab Analizi
                </Button>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#3B82F6' }} />
                </Box>
              )}

              {(analysis || treatmentSuggestions || labAnalysis) && (
                <Box sx={{ mt: 2 }}>
                  {analysis && (
                    <Accordion 
                      defaultExpanded 
                      sx={{
                        mb: 2,
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px !important',
                        '&:before': {
                          display: 'none',
                        },
                        '& .MuiAccordionSummary-root': {
                          borderRadius: '8px',
                          '&:hover': {
                            background: 'rgba(59, 130, 246, 0.05)',
                          }
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ color: '#3B82F6' }} />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            color: '#3B82F6',
                            fontWeight: 500
                          }
                        }}
                      >
                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PsychologyIcon fontSize="small" /> Genel Analiz
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {analysis.error ? (
                          <Typography variant="body2" color="error">
                            {analysis.rawResponse}
                          </Typography>
                        ) : (
                          <Box>
                            {analysis.differentials && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3B82F6', mb: 1 }}>
                                  🎯 Diferansiyel Tanılar:
                                </Typography>
                                {analysis.differentials.map((diff, index) => (
                                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(59, 130, 246, 0.05)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {diff.dx} (Olasılık: {Math.round(diff.likelihood * 100)}%)
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {diff.rationale}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {analysis.tests && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10B981', mb: 1 }}>
                                  🔬 Önerilen Testler:
                                </Typography>
                                {analysis.tests.map((test, index) => (
                                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {test.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {test.why}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {analysis.red_flags && analysis.red_flags.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#EF4444', mb: 1 }}>
                                  ⚠️ Kırmızı Bayraklar:
                                </Typography>
                                {analysis.red_flags.map((flag, index) => (
                                  <Typography key={index} variant="body2" color="error" sx={{ mb: 0.5 }}>
                                    • {flag}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {treatmentSuggestions && (
                    <Accordion 
                      defaultExpanded 
                      sx={{
                        mb: 2,
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px !important',
                        '&:before': {
                          display: 'none',
                        },
                        '& .MuiAccordionSummary-root': {
                          borderRadius: '8px',
                          '&:hover': {
                            background: 'rgba(16, 185, 129, 0.05)',
                          }
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ color: '#10B981' }} />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            color: '#10B981',
                            fontWeight: 500
                          }
                        }}
                      >
                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicalServicesIcon fontSize="small" /> Tedavi Önerileri
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {treatmentSuggestions.error ? (
                          <Typography variant="body2" color="error">
                            {treatmentSuggestions.rawResponse}
                          </Typography>
                        ) : (
                          <Box>
                            {treatmentSuggestions.treatments && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10B981', mb: 1 }}>
                                  💊 Tedavi Önerileri:
                                </Typography>
                                {treatmentSuggestions.treatments.map((treatment, index) => (
                                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {treatment.treatment} 
                                      <span style={{ 
                                        color: treatment.priority === 'yüksek' ? '#EF4444' : 
                                               treatment.priority === 'orta' ? '#F59E0B' : '#10B981',
                                        marginLeft: '8px',
                                        fontSize: '0.8em'
                                      }}>
                                        ({treatment.priority} öncelik)
                                      </span>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {treatment.rationale}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {treatmentSuggestions.medications && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8B5CF6', mb: 1 }}>
                                  💊 İlaç Önerileri:
                                </Typography>
                                {treatmentSuggestions.medications.map((med, index) => (
                                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {med.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Doz: {med.dosage} | Süre: {med.duration}
                                    </Typography>
                                    {med.notes && (
                                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        Not: {med.notes}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {treatmentSuggestions.monitoring && treatmentSuggestions.monitoring.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#F59E0B', mb: 1 }}>
                                  📊 İzleme:
                                </Typography>
                                {treatmentSuggestions.monitoring.map((item, index) => (
                                  <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    • {item}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                            
                            {treatmentSuggestions.follow_up && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#06B6D4', mb: 1 }}>
                                  📅 Takip:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {treatmentSuggestions.follow_up}
                                </Typography>
                              </Box>
                            )}
                            
                            {treatmentSuggestions.prognosis && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#059669', mb: 1 }}>
                                  🔮 Prognoz:
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: treatmentSuggestions.prognosis === 'iyi' ? '#059669' : 
                                         treatmentSuggestions.prognosis === 'orta' ? '#D97706' : '#DC2626',
                                  fontWeight: 600
                                }}>
                                  {treatmentSuggestions.prognosis === 'iyi' ? 'İyi' : 
                                   treatmentSuggestions.prognosis === 'orta' ? 'Orta' : 'Kötü'}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {labAnalysis && (
                    <Accordion 
                      defaultExpanded 
                      sx={{
                        mb: 2,
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                        borderRadius: '8px !important',
                        '&:before': {
                          display: 'none',
                        },
                        '& .MuiAccordionSummary-root': {
                          borderRadius: '8px',
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.05)',
                          }
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ color: '#6366F1' }} />}
                        sx={{
                          '& .MuiAccordionSummary-content': {
                            color: '#6366F1',
                            fontWeight: 500
                          }
                        }}
                      >
                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScienceIcon fontSize="small" /> Laboratuvar Analizi
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {labAnalysis.error ? (
                          <Typography variant="body2" color="error">
                            {labAnalysis.rawResponse}
                          </Typography>
                        ) : (
                          <Box>
                            {labAnalysis.abnormalities && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#EF4444', mb: 1 }}>
                                  ⚠️ Anormallikler:
                                </Typography>
                                {labAnalysis.abnormalities.map((abnormality, index) => (
                                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {abnormality.parameter}: {abnormality.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Normal: {abnormality.reference_range}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {abnormality.significance}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {labAnalysis.interpretation && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6366F1', mb: 1 }}>
                                  📋 Yorum:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {labAnalysis.interpretation}
                                </Typography>
                              </Box>
                            )}
                            
                            {labAnalysis.recommendations && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10B981', mb: 1 }}>
                                  💡 Öneriler:
                                </Typography>
                                {labAnalysis.recommendations.map((rec, index) => (
                                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {rec.action}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {rec.reason}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            
                            {labAnalysis.differential_diagnosis && labAnalysis.differential_diagnosis.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8B5CF6', mb: 1 }}>
                                  🎯 Diferansiyel Tanı:
                                </Typography>
                                {labAnalysis.differential_diagnosis.map((dx, index) => (
                                  <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    • {dx}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                            
                            {labAnalysis.next_steps && labAnalysis.next_steps.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#F59E0B', mb: 1 }}>
                                  ➡️ Sonraki Adımlar:
                                </Typography>
                                {labAnalysis.next_steps.map((step, index) => (
                                  <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    • {step}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        </Paper>
      </Fade>
    </Box>
  );
};

export default AIAnalysis;