import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Skeleton,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Pending as PendingIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { getAllDoctors } from '../services/colleagueService';
import { sendConnectionRequest, respondToConnectionRequest, removeConnection } from '../services/colleagueService';
import { useAuth } from '../context/AuthContext';

const DoctorsList = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [mainSpecialtyFilter, setMainSpecialtyFilter] = useState('all');
  const [subSpecialtyFilter, setSubSpecialtyFilter] = useState('all');
  const [connectionFilter, setConnectionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getAllDoctors();
      console.log('Doktor verileri alındı:', data);
      console.log('Avatar örnekleri:', data.slice(0, 3).map(d => ({ name: d.name, avatar: d.avatar })));
      
      // Her doktor için avatar bilgisini detaylı kontrol et
      data.forEach((doctor, index) => {
        console.log(`Doktor ${index + 1}:`, {
          name: doctor.name,
          avatar: doctor.avatar,
          avatarType: typeof doctor.avatar,
          avatarLength: doctor.avatar ? doctor.avatar.length : 0,
          avatarPath: doctor.avatar ? `/avatars/${doctor.avatar}` : 'undefined',
          avatarExists: doctor.avatar && doctor.avatar.trim() && /\.(png|jpg|jpeg|svg)$/i.test(doctor.avatar.trim())
        });
      });
      
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationScore = (doctor) => {
    let score = 0;
    
    // Same main specialty
    if (doctor.mainSpecialty === user?.mainSpecialty) score += 3;
    
    // Same city
    if (doctor.city === user?.city) score += 2;
    
    return score;
  };

  // Filter and sort doctors
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = doctors.filter(doctor => {
      // Skip current user
      if (doctor._id === user?._id) return false;

      // Search filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch = 
          doctor.name?.toLowerCase().includes(searchLower) ||
          doctor.mainSpecialty?.toLowerCase().includes(searchLower) ||
          doctor.city?.toLowerCase().includes(searchLower) ||
          doctor.institution?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Main specialty filter
      if (mainSpecialtyFilter !== 'all' && doctor.mainSpecialty !== mainSpecialtyFilter) {
        return false;
      }

      // Sub specialty filter
      if (subSpecialtyFilter !== 'all' && !doctor.subspecialties?.includes(subSpecialtyFilter)) {
        return false;
      }

      // Connection filter
      if (connectionFilter === 'connected' && doctor.connectionStatus !== 'connected') {
        return false;
      } else if (connectionFilter === 'pending' && !['sent', 'received'].includes(doctor.connectionStatus)) {
        return false;
      }

      return true;
    });

    // Sort doctors
    switch (sortBy) {
      case 'recommended':
        // Sort by recommendation score (same specialty + city + connection count)
        filtered.sort((a, b) => {
          const scoreA = getRecommendationScore(a);
          const scoreB = getRecommendationScore(b);
          return scoreB - scoreA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [doctors, debouncedSearchQuery, mainSpecialtyFilter, subSpecialtyFilter, connectionFilter, sortBy, user?._id]);

  const handleConnect = async (doctor) => {
    try {
      await sendConnectionRequest(doctor._id);
      setSnackbar({
        open: true,
        message: 'Bağlantı isteği başarıyla gönderildi',
        severity: 'success'
      });
      fetchDoctors();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleRespond = async (connectionId, status) => {
    try {
      await respondToConnectionRequest(connectionId, status);
      setSnackbar({
        open: true,
        message: status === 'accepted' ? 'Bağlantı isteği kabul edildi' : 'Bağlantı isteği reddedildi',
        severity: 'success'
      });
      fetchDoctors();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await removeConnection(connectionId);
      setSnackbar({
        open: true,
        message: 'Bağlantı başarıyla kaldırıldı',
        severity: 'success'
      });
      fetchDoctors();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleCancelRequest = async (connectionId) => {
    try {
      await removeConnection(connectionId);
      setSnackbar({
        open: true,
        message: 'Bağlantı isteği başarıyla iptal edildi',
        severity: 'success'
      });
      fetchDoctors();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const getConnectionButton = (doctor) => {
    switch (doctor.connectionStatus) {
      case 'connected':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <Chip
              icon={<CheckIcon />}
              label="Bağlantı"
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => handleRemoveConnection(doctor.connectionId)}
              startIcon={<DeleteIcon />}
              sx={{ fontSize: '0.75rem', py: 0.5 }}
            >
              Bağlantıyı Kaldır
            </Button>
          </Box>
        );
             case 'sent':
         return (
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
             <Chip
               icon={<PendingIcon />}
               label="Beklemede"
               color="default"
               variant="outlined"
               size="small"
               sx={{ fontSize: '0.75rem' }}
             />
             <Button
               size="small"
               color="error"
               variant="outlined"
               onClick={() => handleCancelRequest(doctor.connectionId)}
               startIcon={<CloseIcon />}
               sx={{ fontSize: '0.75rem', py: 0.5 }}
             >
               İsteği İptal Et
             </Button>
           </Box>
         );
      case 'received':
        return (
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckIcon />}
              onClick={() => handleRespond(doctor.connectionId, 'accepted')}
              sx={{ fontSize: '0.75rem', py: 0.5, flex: 1 }}
            >
              Kabul Et
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CloseIcon />}
              onClick={() => handleRespond(doctor.connectionId, 'rejected')}
              sx={{ fontSize: '0.75rem', py: 0.5, flex: 1 }}
            >
              Reddet
            </Button>
          </Box>
        );
      case 'rejected':
        return (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => handleConnect(doctor)}
            sx={{ fontSize: '0.75rem', py: 0.5, width: '100%' }}
          >
            Tekrar Gönder
          </Button>
        );
      default:
        return (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => handleConnect(doctor)}
            sx={{ fontSize: '0.75rem', py: 0.5, width: '100%' }}
          >
            Bağlantı Gönder
          </Button>
        );
    }
  };

  const renderDoctorCard = (doctor) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Top section: Avatar, Name, and Main Specialty */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar 
            src={(() => {
              // Avatar dosya adını güvenli hale getir
              if (doctor.avatar && doctor.avatar.trim()) {
                const avatarName = doctor.avatar.trim();
                // Sadece güvenli dosya uzantılarına izin ver
                if (/\.(png|jpg|jpeg|svg)$/i.test(avatarName)) {
                  return `/avatars/${avatarName}`;
                }
              }
              return undefined;
            })()}
            sx={{ 
              width: 72, 
              height: 72, 
              fontSize: '24px',
              background: '#E5E7EB',
              color: '#6B7280',
              mr: 2
            }}
            alt={`${doctor.name}'nın avatarı`}
            onError={(e) => {
              console.log('Avatar yüklenemedi:', {
                doctorName: doctor.name,
                avatar: doctor.avatar,
                avatarPath: `/avatars/${doctor.avatar}`,
                error: e
              });
              // Avatar yüklenemezse, src'yi kaldır ve fallback olarak baş harfi göster
              e.target.src = '';
              // Avatar yüklenemezse, fallback olarak baş harfi göster
              e.target.style.display = 'none';
            }}
          >
            {doctor.name?.charAt(0)}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#101828',
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Dr. {doctor.name}
            </Typography>
            
            <Chip
              label={doctor.mainSpecialty || 'Uzmanlık Belirtilmemiş'}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ 
                fontSize: '0.75rem',
                height: '24px',
                fontWeight: 500
              }}
            />
          </Box>
        </Box>

        {/* Middle section: Location/Institution or Bio */}
        <Box sx={{ mb: 3 }}>
          {doctor.city || doctor.institution ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {doctor.city && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                  <Typography variant="body2" color="#667085" sx={{ fontSize: '0.875rem' }}>
                    {doctor.city}
                  </Typography>
                </Box>
              )}
              {doctor.institution && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                  <Typography variant="body2" color="#667085" sx={{ fontSize: '0.875rem' }}>
                    {doctor.institution}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : doctor.bio ? (
            <Typography 
              variant="body2" 
              color="#667085" 
              sx={{ 
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {doctor.bio}
            </Typography>
          ) : null}

          {/* Subspecialties */}
          {doctor.subspecialties?.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {doctor.subspecialties.slice(0, 3).map((specialty, index) => (
                <Chip
                  key={index}
                  label={specialty}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: '20px',
                    borderColor: '#E5E7EB',
                    color: '#6B7280'
                  }}
                />
              ))}
              {doctor.subspecialties.length > 3 && (
                <Chip
                  label={`+${doctor.subspecialties.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: '20px',
                    borderColor: '#E5E7EB',
                    color: '#6B7280'
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Bottom section: Action buttons */}
        <Box sx={{ mt: 'auto' }}>
          {getConnectionButton(doctor)}
          
          <Button
            variant="text"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => {/* TODO: Navigate to profile */}}
            sx={{ 
              fontSize: '0.75rem', 
              py: 0.5, 
              width: '100%', 
              mt: 1,
              color: '#667085',
              '&:hover': {
                background: 'rgba(102, 112, 133, 0.08)'
              }
            }}
          >
            Profili Gör
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSkeletonCard = () => (
    <Card sx={{ height: '100%', borderRadius: '16px' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton variant="circular" width={72} height={72} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="60%" height={24} sx={{ borderRadius: '12px' }} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={16} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: '10px' }} />
          <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: '10px' }} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: '16px' }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            onClick={fetchDoctors} 
            sx={{ ml: 2 }}
            size="small"
          >
            Tekrar Dene
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#101828', mb: 1 }}>
          Meslektaşlar
        </Typography>
        <Typography variant="body1" color="#667085">
          Veteriner hekimlerle bağlantı kurun ve konsültasyon sistemini kullanın
        </Typography>
      </Box>

      {/* Filter and Search Bar */}
      <Box sx={{ 
        background: 'white', 
        borderRadius: '16px', 
        p: 3, 
        mb: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #EAECF0'
      }}>
        <Grid container spacing={3} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Ad, kurum veya uzmanlık ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#D1D5DB',
                  },
                },
              }}
            />
          </Grid>

          {/* Main Specialty Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Ana Branş</InputLabel>
              <Select
                value={mainSpecialtyFilter}
                onChange={(e) => setMainSpecialtyFilter(e.target.value)}
                label="Ana Branş"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="Onkoloji">Onkoloji</MenuItem>
                <MenuItem value="Cerrahi">Cerrahi</MenuItem>
                <MenuItem value="İç Hastalıkları">İç Hastalıkları</MenuItem>
                <MenuItem value="Dermatoloji">Dermatoloji</MenuItem>
                <MenuItem value="Kardiyoloji">Kardiyoloji</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Connection Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Bağlantı</InputLabel>
              <Select
                value={connectionFilter}
                onChange={(e) => setConnectionFilter(e.target.value)}
                label="Bağlantı"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="connected">Bağlı</MenuItem>
                <MenuItem value="pending">Bekleyen</MenuItem>
                <MenuItem value="none">Bağlantısız</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sırala</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sırala"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="recommended">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ fontSize: 16 }} />
                    Önerilenler
                  </Box>
                </MenuItem>
                <MenuItem value="newest">En Yeni</MenuItem>
                <MenuItem value="alphabetical">A-Z</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Results Count */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="body2" color="#667085" sx={{ textAlign: 'center' }}>
              {filteredAndSortedDoctors.length} sonuç
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Doctors Grid */}
      <Grid container spacing={3}>
        {loading 
          ? Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                {renderSkeletonCard()}
              </Grid>
            ))
          : filteredAndSortedDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doctor._id}>
                {renderDoctorCard(doctor)}
              </Grid>
            ))
        }
      </Grid>

      {/* Empty State */}
      {!loading && filteredAndSortedDoctors.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="#6B7280" sx={{ mb: 2 }}>
            Sonuç bulunamadı
          </Typography>
          <Typography variant="body2" color="#9CA3AF" sx={{ mb: 3 }}>
            Arama kriterlerinizi değiştirmeyi deneyin
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setMainSpecialtyFilter('all');
              setSubSpecialtyFilter('all');
              setConnectionFilter('all');
              setSortBy('recommended');
            }}
          >
            Filtreleri Temizle
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DoctorsList;
