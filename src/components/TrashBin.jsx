import React, { useState, useEffect } from 'react';
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
  Divider,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://loroncology.onrender.com' : 'http://localhost:5000');

const TrashBin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [deletedPatients, setDeletedPatients] = useState([]);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('dateDesc');

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchDeletedPatients();
  }, []);

  const fetchDeletedPatients = async () => {
    try {
      setLoading(true);
      
      // Gerçek API'den silinen hasta verilerini çek
      const response = await fetch(`${API_URL}/api/patients/deleted`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Silinen hastalar yüklenirken bir hata oluştu`);
      }
      
      const data = await response.json();
      setDeletedPatients(data);
      setError(null);
    } catch (error) {
      console.error('Fetch deleted patients error:', error);
      setError(`Bağlantı hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${selectedPatient._id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Hasta geri getirilirken bir hata oluştu');
      }

      setDeletedPatients(deletedPatients.filter(p => p._id !== selectedPatient._id));
      setRestoreDialogOpen(false);
      setSelectedPatient(null);
      setSuccess(`${selectedPatient.hastaAdi} başarıyla geri getirildi!`);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${selectedPatient._id}/permanent-delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Hasta kalıcı olarak silinirken bir hata oluştu');
      }

      setDeletedPatients(deletedPatients.filter(p => p._id !== selectedPatient._id));
      setPermanentDeleteDialogOpen(false);
      setSelectedPatient(null);
      setSuccess(`${selectedPatient.hastaAdi} kalıcı olarak silindi!`);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setSelectedPatient(null);
  };

  const handlePermanentDeleteCancel = () => {
    setPermanentDeleteDialogOpen(false);
    setSelectedPatient(null);
  };

  // Filtered and sorted deleted patients
  const filteredAndSortedDeletedPatients = deletedPatients.filter(patient => {
    const matchesSearch = patient.hastaAdi ? 
      patient.hastaAdi.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : false;
    const matchesFilter = filterType === '' || patient.tur === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'dateDesc') {
      return new Date(b.deletedAt || b.updatedAt) - new Date(a.deletedAt || a.updatedAt);
    } else if (sortBy === 'dateAsc') {
      return new Date(a.deletedAt || a.updatedAt) - new Date(b.deletedAt || b.updatedAt);
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

  const renderSkeletonCards = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ 
            borderRadius: '8px',
            boxShadow: 'var(--facebook-shadow)',
            border: '1px solid var(--facebook-border)',
            opacity: 0.7
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
      backgroundColor: 'var(--facebook-white)',
      borderRadius: '8px',
      border: '1px solid var(--facebook-border)'
    }}>
      <DeleteIcon sx={{ fontSize: 64, color: '#98A2B3', mb: 2 }} />
      <Typography variant="h6" color="#101828" sx={{ mb: 1, fontWeight: 600 }}>
        Geri Dönüşüm Kutusu Boş
      </Typography>
      <Typography variant="body2" color="#667085" sx={{ mb: 3 }}>
        {searchTerm || filterType ? 'Arama kriterlerine uygun silinen hasta bulunamadı.' : 'Henüz silinen hasta bulunmuyor.'}
      </Typography>
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/hastalar')}
        sx={{
          backgroundColor: 'var(--facebook-blue)',
          '&:hover': { backgroundColor: 'var(--facebook-blue-hover)' },
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1.5,
          borderRadius: '6px'
        }}
      >
        Hasta Listesine Dön
      </Button>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'var(--facebook-light-gray)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/hastalar')}
              sx={{
                borderColor: '#D0D5DD',
                color: '#667085',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '6px',
                '&:hover': {
                  borderColor: '#98A2B3',
                  backgroundColor: '#F8FAFC'
                }
              }}
            >
              Geri
            </Button>
            <Box>
              <Typography variant="h4" component="h1" sx={{ 
                color: '#101828',
                fontWeight: 700,
                fontSize: '24px',
                mb: 0.5
              }}>
                Geri Dönüşüm Kutusu
              </Typography>
              <Typography variant="body2" color="#667085">
                ({filteredAndSortedDeletedPatients.length} silinen kayıt)
              </Typography>
            </Box>
          </Box>
          <Badge badgeContent={deletedPatients.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '12px' } }}>
            <DeleteIcon sx={{ fontSize: 32, color: '#D92D20' }} />
          </Badge>
        </Box>

        {/* Filter Bar */}
        <Box sx={{ 
          mb: 4,
          p: 3,
          backgroundColor: 'var(--facebook-white)',
          borderRadius: '8px',
          border: '1px solid var(--facebook-border)',
          boxShadow: 'var(--facebook-shadow)'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Silinen hasta adı ile ara"
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
                  <MenuItem value="dateDesc">Silinme Tarihi (Yeni→Eski)</MenuItem>
                  <MenuItem value="dateAsc">Silinme Tarihi (Eski→Yeni)</MenuItem>
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
              onClick={fetchDeletedPatients}
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

        {/* Success State */}
        {success && (
          <Alert severity="success" sx={{ 
            mb: 3,
            borderRadius: '12px',
            border: '1px solid #D1FADF',
            backgroundColor: '#F6FEF9'
          }}>
            <Typography variant="body2" color="#039855">
              {success}
            </Typography>
          </Alert>
        )}

        {/* Deleted Patient Cards */}
        {loading ? (
          renderSkeletonCards()
        ) : filteredAndSortedDeletedPatients.length === 0 ? (
          renderEmptyState()
        ) : (
          <Grid container spacing={3}>
            {filteredAndSortedDeletedPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} key={patient._id}>
                                 <Card 
                   sx={{ 
                     height: '100%',
                     display: 'flex',
                     flexDirection: 'column',
                     backgroundColor: 'var(--facebook-white)',
                     borderRadius: '8px',
                     boxShadow: 'var(--facebook-shadow)',
                     border: '1px solid var(--facebook-border)',
                     opacity: 0.8,
                     position: 'relative',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: '4px',
                       backgroundColor: '#D92D20',
                       borderTopLeftRadius: '8px',
                       borderTopRightRadius: '8px'
                     }
                   }}
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

                    {/* Deletion Info */}
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#FEF3F2', 
                      borderRadius: '12px',
                      border: '1px solid #FEE4E2'
                    }}>
                      <Typography variant="body2" color="#D92D20" gutterBottom sx={{ fontWeight: 600, fontSize: '14px' }}>
                        🗑️ Silinme Bilgisi
                      </Typography>
                      <Typography variant="body2" color="#667085" sx={{ fontSize: '13px' }}>
                        {patient.deletedAt ? 
                          `Silinme Tarihi: ${new Date(patient.deletedAt).toLocaleDateString('tr-TR')}` : 
                          'Silinme tarihi belirtilmemiş'
                        }
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
                       variant="contained"
                       fullWidth
                       onClick={() => {
                         setSelectedPatient(patient);
                         setRestoreDialogOpen(true);
                       }}
                       startIcon={<RestoreIcon />}
                       sx={{
                         backgroundColor: '#039855',
                         '&:hover': { backgroundColor: '#027A48' },
                         textTransform: 'none',
                         fontWeight: 500,
                         fontSize: '14px',
                         borderRadius: '6px',
                         py: 1,
                         boxShadow: 'var(--facebook-shadow)'
                       }}
                     >
                       Geri Getir
                     </Button>

                                         <Button
                       size="small"
                       variant="outlined"
                       fullWidth
                       onClick={() => {
                         setSelectedPatient(patient);
                         setPermanentDeleteDialogOpen(true);
                       }}
                       startIcon={<DeleteForeverIcon />}
                       sx={{
                         borderColor: '#D92D20',
                         color: '#D92D20',
                         textTransform: 'none',
                         fontWeight: 500,
                         fontSize: '14px',
                         borderRadius: '6px',
                         py: 1,
                         '&:hover': {
                           borderColor: '#B42318',
                           backgroundColor: '#FEF3F2'
                         }
                       }}
                     >
                       Kalıcı Sil
                     </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={handleRestoreCancel}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            border: '1px solid var(--facebook-border)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#101828',
          fontWeight: 600,
          fontSize: '18px',
          pb: 1
        }}>
          Hastayı geri getirmek üzeresiniz
        </DialogTitle>
        <DialogContent>
          <Box sx={{ color: '#667085', fontSize: '14px' }}>
            {selectedPatient && (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>{selectedPatient.hastaAdi}</strong> isimli hastanın kaydını geri getirmek istediğinizden emin misiniz?
                </Typography>
                <Box sx={{ backgroundColor: 'var(--facebook-light-gray)', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" color="#667085" sx={{ mb: 0.5 }}>
                    <strong>Protokol No:</strong> {selectedPatient.protokolNo}
                  </Typography>
                  <Typography variant="body2" color="#667085">
                    <strong>Hasta Sahibi:</strong> {selectedPatient.hastaSahibi}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleRestoreCancel}
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
            onClick={handleRestoreConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#039855',
              '&:hover': { backgroundColor: '#027A48' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: '6px'
            }}
          >
            Geri Getir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={handlePermanentDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            border: '1px solid var(--facebook-border)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#D92D20',
          fontWeight: 600,
          fontSize: '18px',
          pb: 1
        }}>
          ⚠️ Kalıcı Silme Uyarısı
        </DialogTitle>
        <DialogContent>
          <Box sx={{ color: '#667085', fontSize: '14px' }}>
            {selectedPatient && (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>{selectedPatient.hastaAdi}</strong> isimli hastanın kaydını <strong>kalıcı olarak</strong> silmek üzeresiniz!
                </Typography>
                <Box sx={{ backgroundColor: '#FEF3F2', p: 2, borderRadius: '8px', border: '1px solid #FEE4E2', mb: 2 }}>
                  <Typography variant="body2" color="#D92D20" sx={{ mb: 0.5, fontWeight: 600 }}>
                    ⚠️ Bu işlem geri alınamaz!
                  </Typography>
                  <Typography variant="body2" color="#667085">
                    Hasta kaydı ve tüm veriler kalıcı olarak silinecektir.
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: 'var(--facebook-light-gray)', p: 2, borderRadius: '8px' }}>
                  <Typography variant="body2" color="#667085" sx={{ mb: 0.5 }}>
                    <strong>Protokol No:</strong> {selectedPatient.protokolNo}
                  </Typography>
                  <Typography variant="body2" color="#667085">
                    <strong>Hasta Sahibi:</strong> {selectedPatient.hastaSahibi}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handlePermanentDeleteCancel}
            sx={{
              color: '#667085',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#F8FAFC' }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handlePermanentDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#D92D20',
              '&:hover': { backgroundColor: '#B42318' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: '6px'
            }}
          >
            Kalıcı Olarak Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TrashBin;
