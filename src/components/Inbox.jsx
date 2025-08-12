import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Mail as MailIcon,
  Send as SendIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  getConsultationInbox,
  updateConsultationStatus,
  getConsultationMessages,
  sendMessage
} from '../services/consultationService';

const Inbox = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageDialog, setMessageDialog] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, [activeTab]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const allConsultations = await getConsultationInbox();
      
      // Tab'a göre filtrele
      const filteredConsultations = allConsultations.filter(consultation => {
        if (activeTab === 0) {
          return consultation.type === 'incoming';
        } else {
          return consultation.type === 'sent';
        }
      });
      
      setConsultations(filteredConsultations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationClick = async (consultation) => {
    setSelectedConsultation(consultation);
    try {
      const messages = await getConsultationMessages(consultation._id);
      setMessages(messages);
      setMessageDialog(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (consultationId, newStatus) => {
    try {
      await updateConsultationStatus(consultationId, newStatus);
      await fetchConsultations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(selectedConsultation._id, {
        content: newMessage,
        sender: user._id
      });
      const updatedMessages = await getConsultationMessages(selectedConsultation._id);
      setMessages(updatedMessages);
      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      accepted: 'info',
      completed: 'success',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Beklemede',
      accepted: 'Kabul Edildi',
      completed: 'Tamamlandı',
      rejected: 'Reddedildi'
    };
    return texts[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Konsültasyon Gelen Kutusu
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<MailIcon />} label="Gelen Konsültasyonlar" />
          <Tab icon={<SendIcon />} label="Gönderilen Konsültasyonlar" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <List>
          {consultations.map((consultation) => (
            <Paper key={consultation._id} sx={{ mb: 2 }}>
              <ListItem
                button
                onClick={() => handleConsultationClick(consultation)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="subtitle1" component="span">
                        {activeTab === 0 
                          ? `Dr. ${consultation.senderDoctor.name}`
                          : `Dr. ${consultation.receiverDoctor.name}`}
                      </Typography>
                      <Chip
                        size="small"
                        label={getStatusText(consultation.status)}
                        color={getStatusColor(consultation.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        Hasta: {consultation.patient.hastaAdi} ({consultation.patient.tur} - {consultation.patient.irk})
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {consultation.notes.substring(0, 100)}...
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1} component="span">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {new Date(consultation.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* Mesajlaşma Dialog'u */}
      <Dialog
        open={messageDialog}
        onClose={() => setMessageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedConsultation && (
            <>
              Hasta: {selectedConsultation.patient.hastaAdi} ({selectedConsultation.patient.tur} - {selectedConsultation.patient.irk})
              <Chip
                size="small"
                label={getStatusText(selectedConsultation?.status)}
                color={getStatusColor(selectedConsultation?.status)}
                sx={{ ml: 2 }}
              />
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Hasta Bilgileri:
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">
                <strong>Hasta Adı:</strong> {selectedConsultation?.patient.hastaAdi}
              </Typography>
              <Typography variant="body2">
                <strong>Hasta Sahibi:</strong> {selectedConsultation?.patient.hastaSahibi}
              </Typography>
              <Typography variant="body2">
                <strong>Tür:</strong> {selectedConsultation?.patient.tur}
              </Typography>
              <Typography variant="body2">
                <strong>Irk:</strong> {selectedConsultation?.patient.irk}
              </Typography>
              <Typography variant="body2">
                <strong>Yaş:</strong> {selectedConsultation?.patient.yas} yaş
              </Typography>
              <Typography variant="body2">
                <strong>Cinsiyet:</strong> {selectedConsultation?.patient.cinsiyet}
              </Typography>
              {selectedConsultation?.patient.kilo && (
                <Typography variant="body2">
                  <strong>Kilo:</strong> {selectedConsultation?.patient.kilo} kg
                </Typography>
              )}
              {selectedConsultation?.patient.protokolNo && (
                <Typography variant="body2">
                  <strong>Protokol No:</strong> {selectedConsultation?.patient.protokolNo}
                </Typography>
              )}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Konsültasyon Notu:
            </Typography>
            <Typography variant="body2" paragraph>
              {selectedConsultation?.notes}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {messages.map((message) => (
              <ListItem
                key={message._id}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: message.sender._id === user._id ? 'primary.light' : 'grey.100',
                    color: message.sender._id === user._id ? 'white' : 'inherit',
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(message.createdAt).toLocaleTimeString('tr-TR')}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Mesajınızı yazın..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              Gönder
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          {activeTab === 0 && selectedConsultation?.status === 'pending' && (
            <>
              <Button
                onClick={() => handleStatusChange(selectedConsultation._id, 'accepted')}
                color="primary"
              >
                Kabul Et
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedConsultation._id, 'rejected')}
                color="error"
              >
                Reddet
              </Button>
            </>
          )}
          {selectedConsultation?.status === 'accepted' && (
            <Button
              onClick={() => handleStatusChange(selectedConsultation._id, 'completed')}
              color="success"
            >
              Tamamlandı
            </Button>
          )}
          <Button onClick={() => setMessageDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Inbox;
