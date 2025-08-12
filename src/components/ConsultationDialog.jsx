import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  MenuItem
} from '@mui/material';
import { sendConsultation, getDoctors } from '../services/consultationService';

const ConsultationDialog = ({ open, onClose, patient }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !notes.trim()) return;

    console.log('=== Frontend Konsültasyon Debug ===');
    console.log('Seçilen Doktor ID:', selectedDoctor);
    console.log('Hasta ID:', patient._id);
    console.log('Notlar:', notes.trim());

    try {
      setLoading(true);
      setError(null);

      await sendConsultation({
        patient: patient._id,
        receiverDoctor: selectedDoctor,
        notes: notes.trim()
      });

      onClose();
      setSelectedDoctor('');
      setNotes('');
    } catch (err) {
      console.log('Frontend Konsültasyon Hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Konsültasyon İsteği Gönder</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
          Hasta: {patient?.name}
        </Typography>

        <TextField
          select
          fullWidth
          label="Doktor Seçin"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          margin="normal"
        >
          {doctors.map((doctor) => (
            <MenuItem key={doctor._id} value={doctor._id}>
              Dr. {doctor.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Konsültasyon Notu"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
          placeholder="Lütfen konsültasyon detaylarını ve önemli noktaları belirtin..."
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedDoctor || !notes.trim() || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Gönder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultationDialog;
