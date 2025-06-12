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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_URL = '/api';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/patients`);
      if (!response.ok) {
        throw new Error('Hastalar yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setPatients(data);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/patients/${selectedPatient._id}`, {
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

  const getTurEmoji = (tur) => {
    return tur === 'Kedi' ? '🐱' : '🐕';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Ana Sayfaya Dön
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Kayıtlı Hastalar
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Protokol No</TableCell>
              <TableCell>Hasta Adı</TableCell>
              <TableCell>Hasta Sahibi</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Irk</TableCell>
              <TableCell>Yaş</TableCell>
              <TableCell>VKS</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient._id}>
                <TableCell>{patient.protokolNo}</TableCell>
                <TableCell>{patient.hastaAdi}</TableCell>
                <TableCell>{patient.hastaSahibi}</TableCell>
                <TableCell>
                  <Chip
                    icon={<PetsIcon />}
                    label={`${getTurEmoji(patient.tur)} ${patient.tur}`}
                    color={patient.tur === 'Kedi' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{patient.irk}</TableCell>
                <TableCell>{patient.yas}</TableCell>
                <TableCell>
                  <Chip
                    label={`VKS: ${patient.vks}`}
                    color={patient.vks > 5 ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Detay">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/hasta/${patient._id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(patient)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Container>
  );
};

export default PatientList; 