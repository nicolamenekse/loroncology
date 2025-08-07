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

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const AIAnalysis = ({ patientId }) => {
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
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/patients/${patientId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/patients/${patientId}/treatment-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/patients/${patientId}/analyze-lab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  const clearAnalysis = () => {
    setAnalysis(null);
    setTreatmentSuggestions(null);
    setLabAnalysis(null);
    setError(null);
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
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15) !important'
            }
          }}
        >
          <Box
            className="ai-analysis-header"
            onClick={() => setMinimized(false)}
            sx={{
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%) !important'
              }
            }}
          >
            <Typography 
              variant={minimized ? "body1" : "h6"} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: minimized ? '0.9rem' : 'inherit'
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
                  sx={{ color: 'white' }}
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
                  className="ai-analysis-button"
                  onClick={generateAnalysis}
                  disabled={loading}
                  startIcon={<PsychologyIcon />}
                  size="small"
                >
                  Genel Analiz
                </Button>
                <Button
                  className="ai-analysis-button"
                  onClick={generateTreatmentSuggestions}
                  disabled={loading}
                  startIcon={<MedicalServicesIcon />}
                  size="small"
                >
                  Tedavi Önerileri
                </Button>
                <Button
                  className="ai-analysis-button"
                  onClick={generateLabAnalysis}
                  disabled={loading}
                  startIcon={<ScienceIcon />}
                  size="small"
                >
                  Lab Analizi
                </Button>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {(analysis || treatmentSuggestions || labAnalysis) && (
                <Box sx={{ mt: 2 }}>
                  {analysis && (
                    <Accordion defaultExpanded className="ai-analysis-accordion">
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PsychologyIcon fontSize="small" /> Genel Analiz
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            '&::-webkit-scrollbar': {
                              width: '8px'
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(0,0,0,0.1)',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(59, 130, 246, 0.5)',
                              borderRadius: '4px',
                              '&:hover': {
                                background: 'rgba(59, 130, 246, 0.7)'
                              }
                            }
                          }}
                        >
                          {analysis}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {treatmentSuggestions && (
                    <Accordion defaultExpanded className="ai-analysis-accordion">
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicalServicesIcon fontSize="small" /> Tedavi Önerileri
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            '&::-webkit-scrollbar': {
                              width: '8px'
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(0,0,0,0.1)',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(59, 130, 246, 0.5)',
                              borderRadius: '4px',
                              '&:hover': {
                                background: 'rgba(59, 130, 246, 0.7)'
                              }
                            }
                          }}
                        >
                          {treatmentSuggestions}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {labAnalysis && (
                    <Accordion defaultExpanded className="ai-analysis-accordion">
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScienceIcon fontSize="small" /> Laboratuvar Analizi
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            '&::-webkit-scrollbar': {
                              width: '8px'
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(0,0,0,0.1)',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(59, 130, 246, 0.5)',
                              borderRadius: '4px',
                              '&:hover': {
                                background: 'rgba(59, 130, 246, 0.7)'
                              }
                            }
                          }}
                        >
                          {labAnalysis}
                        </Typography>
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