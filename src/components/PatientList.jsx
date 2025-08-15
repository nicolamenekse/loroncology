import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Skeleton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const PatientList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [patients, setPatients] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('dateDesc');
  const navigate = useNavigate();

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Gerçek API'den hasta verilerini çek
      const response = await fetch(`${API_URL}/api/patients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Hastalar yüklenirken bir hata oluştu`);
      }
      
      const data = await response.json();
      setPatients(data);
      setError(null);
    } catch (error) {
      console.error('Fetch patients error:', error);
      setError(`Bağlantı hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${selectedPatient._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Hasta silinirken bir hata oluştu');
      }

      setPatients(patients.filter(p => p._id !== selectedPatient._id));
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPatient(null);
  };

  // Filtered and sorted patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.hastaAdi ? 
        patient.hastaAdi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : false;
      const matchesFilter = filterType === '' || patient.tur === filterType;
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'dateDesc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'dateAsc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'nameAsc') {
        const nameA = a.hastaAdi || '';
        const nameB = b.hastaAdi || '';
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'nameDesc') {
        const nameA = a.hastaAdi || '';
        const nameB = b.hastaAdi || '';
        return nameB.localeCompare(nameA);
      }
      return 0;
    });
  }, [patients, debouncedSearchTerm, filterType, sortBy]);

  const handleViewDetails = useCallback((id) => {
    navigate(`/hasta/${id}`);
  }, [navigate]);

  const handleEditPatient = useCallback((id) => {
    navigate(`/hasta-duzenle/${id}`);
  }, [navigate]);



  const renderSkeletonCards = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #EAECF0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '12px' }} />
              </Box>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              ))}
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#F5F8FF', borderRadius: '12px' }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rectangular" width="48%" height={36} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rectangular" width="48%" height={36} sx={{ borderRadius: '8px' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Box sx={{ 
      textAlign: 'center', 
      py: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #EAECF0'
    }}>
      <PetsIcon sx={{ fontSize: 64, color: '#98A2B3', mb: 2 }} />
      <Typography variant="h6" color="#101828" sx={{ mb: 1, fontWeight: 600 }}>
        Kayıt bulunamadı
      </Typography>
      <Typography variant="body2" color="#667085" sx={{ mb: 3 }}>
        {searchTerm || filterType ? 'Arama kriterlerine uygun hasta bulunamadı.' : 'Henüz hasta kaydı bulunmuyor.'}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/yeni-hasta')}
        sx={{
          backgroundColor: '#1877F2',
          '&:hover': { backgroundColor: '#166FE0' },
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1.5,
          borderRadius: '12px'
        }}
      >
        Yeni Hasta Ekle
      </Button>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#F8FAFC',
      pt: 10,
      pb: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              color: '#101828',
              fontWeight: 700,
              fontSize: '24px',
              mb: 0.5
            }}>
              Hasta Listesi
            </Typography>
            <Typography variant="body2" color="#667085">
              ({filteredAndSortedPatients.length} kayıt)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/yeni-hasta')}
            size="large"
            fullWidth={isMobile}
            sx={{ 
              backgroundColor: '#1877F2',
              '&:hover': { backgroundColor: '#166FE0' },
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(24, 119, 242, 0.15)'
            }}
          >
            Yeni Hasta Ekle
          </Button>
        </Box>

        {/* Filter Bar */}
        <Box sx={{ 
          mb: 4,
          p: 3,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #EAECF0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Hasta adı ile ara"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#667085' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#EAECF0' },
                    '&:hover fieldset': { borderColor: '#D0D5DD' },
                    '&.Mui-focused fieldset': { borderColor: '#1877F2' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#667085' }}>Tür</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Tür"
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#EAECF0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D5DD' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2' }
                  }}
                >
                  <MenuItem value="">Hepsi</MenuItem>
                  <MenuItem value="Kedi">🐱 Kedi</MenuItem>
                  <MenuItem value="Köpek">🐕 Köpek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#667085' }}>Sıralama</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sıralama"
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#EAECF0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D5DD' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2' }
                  }}
                >
                  <MenuItem value="dateDesc">Tarih (Yeni→Eski)</MenuItem>
                  <MenuItem value="dateAsc">Tarih (Eski→Yeni)</MenuItem>
                  <MenuItem value="nameAsc">İsim (A→Z)</MenuItem>
                  <MenuItem value="nameDesc">İsim (Z→A)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ 
            mb: 3,
            borderRadius: '12px',
            border: '1px solid #FEE4E2',
            backgroundColor: '#FEF3F2'
          }}>
            <Typography variant="body2" color="#D92D20">
              {error}
            </Typography>
            <Button 
              size="small" 
              onClick={fetchPatients}
              sx={{ 
                mt: 1,
                color: '#D92D20',
                borderColor: '#D92D20',
                '&:hover': { borderColor: '#B42318' }
              }}
              variant="outlined"
            >
              Tekrar Dene
            </Button>
          </Alert>
        )}

        {/* Patient Cards */}
        {loading ? (
          renderSkeletonCards()
        ) : filteredAndSortedPatients.length === 0 ? (
          renderEmptyState()
        ) : (
          <Grid container spacing={3}>
            {filteredAndSortedPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} key={patient._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #EAECF0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                      borderColor: '#D0D5DD',
                      transform: 'translateY(-2px)'
                    },
                    '&:focus-within': {
                      outline: '2px solid #1877F2',
                      outlineOffset: '2px'
                    }
                  }}
                  onClick={() => handleViewDetails(patient._id)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Typography variant="h6" component="div" sx={{ 
                        fontWeight: 600,
                        fontSize: '18px',
                        color: '#101828',
                        lineHeight: 1.3
                      }}>
                        {patient.hastaAdi || 'İsim Belirtilmemiş'}
                      </Typography>
                      <Chip 
                        label={patient.tur} 
                        size="small"
                        sx={{
                          backgroundColor: patient.tur === 'Kedi' ? '#F0F9FF' : '#F0FDF4',
                          color: patient.tur === 'Kedi' ? '#0369A1' : '#166534',
                          borderColor: patient.tur === 'Kedi' ? '#BAE6FD' : '#BBF7D0',
                          fontWeight: 500,
                          borderRadius: '9999px',
                          fontSize: '12px',
                          height: '24px'
                        }}
                      />
                    </Box>

                    {/* Patient Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="#667085" sx={{ fontSize: '13px' }}>
                          Protokol:
                        </Typography>
                        <Typography variant="body2" color="#101828" sx={{ fontSize: '13px', fontWeight: 500 }}>
                          {patient.protokolNo || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="#667085" sx={{ fontSize: '13px' }}>
                          Sahibi:
                        </Typography>
                        <Typography variant="body2" color="#101828" sx={{ fontSize: '13px', fontWeight: 500 }}>
                          {patient.hastaSahibi || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="#667085" sx={{ fontSize: '13px' }}>
                          Irk:
                        </Typography>
                        <Typography variant="body2" color="#101828" sx={{ fontSize: '13px', fontWeight: 500 }}>
                          {patient.irk || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="#667085" sx={{ fontSize: '13px' }}>
                          Yaş:
                        </Typography>
                        <Typography variant="body2" color="#101828" sx={{ fontSize: '13px', fontWeight: 500 }}>
                          {patient.yas ? `${patient.yas} yaş` : 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="#667085" sx={{ fontSize: '13px' }}>
                          VKS:
                        </Typography>
                        <Typography variant="body2" color="#101828" sx={{ fontSize: '13px', fontWeight: 500 }}>
                          {patient.vks || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Doctor Information */}
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#F5F8FF', 
                      borderRadius: '12px',
                      border: '1px solid #D0D5DD'
                    }}>
                      <Typography variant="body2" color="#1877F2" gutterBottom sx={{ fontWeight: 600, fontSize: '14px' }}>
                        Doktor: {patient.doctorName ? `Dr. ${patient.doctorName}` : 'Belirtilmemiş'}
                      </Typography>
                      <Typography variant="body2" color="#667085" sx={{ 
                        fontSize: '13px',
                        fontStyle: 'italic'
                      }}>
                        {patient.doctorEmail || 'Email belirtilmemiş'}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <Box sx={{ 
                    p: 3, 
                    pt: 0,
                    display: 'flex',
                    gap: 1
                  }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient._id);
                      }}
                      startIcon={<EditIcon />}
                      sx={{
                        borderColor: '#1877F2',
                        color: '#1877F2',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        borderRadius: '8px',
                        py: 1,
                        '&:hover': {
                          borderColor: '#166FE0',
                          backgroundColor: '#F0F9FF'
                        }
                      }}
                    >
                      Düzenle
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(patient);
                        setDeleteDialogOpen(true);
                      }}
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderColor: '#D92D20',
                        color: '#D92D20',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        borderRadius: '8px',
                        py: 1,
                        '&:hover': {
                          borderColor: '#B42318',
                          backgroundColor: '#FEF3F2'
                        }
                      }}
                    >
                      Sil
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #EAECF0'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#101828',
          fontWeight: 600,
          fontSize: '18px',
          pb: 1
        }}>
          Hastayı silmek üzeresiniz
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#667085', fontSize: '14px' }}>
            {selectedPatient && (
              <>
                <strong>{selectedPatient.hastaAdi}</strong> isimli hastanın kaydını silmek istediğinizden emin misiniz?
                <br /><br />
                <Box sx={{ backgroundColor: '#F8FAFC', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" color="#667085" sx={{ mb: 0.5 }}>
                    <strong>Protokol No:</strong> {selectedPatient.protokolNo}
                  </Typography>
                  <Typography variant="body2" color="#667085">
                    <strong>Hasta Sahibi:</strong> {selectedPatient.hastaSahibi}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{
              color: '#667085',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#F8FAFC' }
            }}
          >
            Geri
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#D92D20',
              '&:hover': { backgroundColor: '#B42318' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientList; 