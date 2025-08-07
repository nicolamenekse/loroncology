import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
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
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('API URL:', API_URL);
      console.log('Fetching patients from:', `${API_URL}/api/patients`);
      
      const response = await fetch(`${API_URL}/api/patients`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Hastalar yüklenirken bir hata oluştu`);
      }
      const data = await response.json();
      console.log('Fetched patients:', data.length, 'patients');
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

  const filteredPatients = patients.filter(patient => {
    // Güvenlik: hastaAdi undefined olabilir, bu yüzden kontrol ediyoruz
    const matchesSearch = patient.hastaAdi ? 
      patient.hastaAdi.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesFilter = filterType === '' || patient.tur === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedPatients = filteredPatients.sort((a, b) => {
    if (sortBy === 'dateDesc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'dateAsc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'nameAsc') {
      // Güvenlik: hastaAdi undefined olabilir
      const nameA = a.hastaAdi || '';
      const nameB = b.hastaAdi || '';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'nameDesc') {
      // Güvenlik: hastaAdi undefined olabilir
      const nameA = a.hastaAdi || '';
      const nameB = b.hastaAdi || '';
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  const handleViewDetails = (id) => {
    navigate(`/hasta/${id}`);
  };

  const handleEditPatient = (id) => {
    navigate(`/hasta-duzenle/${id}`);
  };

  return (
    <div className="patient-list-wrapper fade-in">
      <Container maxWidth="lg">
        <Paper elevation={3} className="patient-list-paper" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
              Hasta Listesi
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/yeni-hasta')}
              size="large"
              fullWidth={isMobile}
              sx={{ 
                py: 1.5,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              Yeni Hasta Ekle
            </Button>
          </Box>

          {/* Arama ve Filtreleme */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Hasta Adı ile Ara"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tür</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Tür"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="Kedi">🐱 Kedi</MenuItem>
                    <MenuItem value="Köpek">🐕 Köpek</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sıralama</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sıralama"
                  >
                    <MenuItem value="dateDesc">Tarih (Yeni-Eski)</MenuItem>
                    <MenuItem value="dateAsc">Tarih (Eski-Yeni)</MenuItem>
                    <MenuItem value="nameAsc">İsim (A-Z)</MenuItem>
                    <MenuItem value="nameDesc">İsim (Z-A)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Hasta Listesi */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : sortedPatients.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {searchTerm || filterType ? 'Arama kriterlerine uygun hasta bulunamadı.' : 'Henüz hasta kaydı bulunmuyor.'}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {sortedPatients.map((patient) => (
                <Grid item xs={12} sm={6} md={4} key={patient._id}>
                  <Card 
                    className="patient-card"
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewDetails(patient._id)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2
                      }}>
                        <Typography variant="h6" component="div" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}>
                          {patient.hastaAdi || 'İsim Belirtilmemiş'}
                        </Typography>
                        <Chip 
                          label={patient.tur} 
                          color={patient.tur === 'Kedi' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Protokol No:</strong> {patient.protokolNo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Sahibi:</strong> {patient.hastaSahibi}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Irk:</strong> {patient.irk}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Yaş:</strong> {patient.yas} yaş
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>VKS:</strong> {patient.vks}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ 
                      p: 2, 
                      pt: 0,
                      display: 'flex',
                      gap: 1,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPatient(patient._id);
                        }}
                        startIcon={<EditIcon />}
                      >
                        Düzenle
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                          setDeleteDialogOpen(true);
                        }}
                        startIcon={<DeleteIcon />}
                      >
                        Sil
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Hasta Kaydını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedPatient && (
              <>
                <strong>{selectedPatient.hastaAdi}</strong> isimli hastanın kaydını silmek istediğinizden emin misiniz?
                <br />
                <br />
                Protokol No: {selectedPatient.protokolNo}
                <br />
                Hasta Sahibi: {selectedPatient.hastaSahibi}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientList; 