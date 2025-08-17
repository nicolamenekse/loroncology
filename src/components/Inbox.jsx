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
  Divider,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Badge
} from '@mui/material';
import {
  Mail as MailIcon,
  Send as SendIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  MedicalServices as MedicalServicesIcon,
  Science as ScienceIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  getConsultationInbox,
  updateConsultationStatus,
  getConsultationMessages,
  sendMessage,
  deleteConsultation,
  archiveConsultation,
  restoreConsultation
} from '../services/consultationService';
import { markConsultationAsRead, markAllConsultationsAsRead, getUnreadConsultationCount } from '../services/notificationService';

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
  const [patientDetailDialog, setPatientDetailDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedConsultationForMenu, setSelectedConsultationForMenu] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [archiveConfirmDialog, setArchiveConfirmDialog] = useState(false);
  const [restoreConfirmDialog, setRestoreConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const { unreadCount: count } = await getUnreadConsultationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Okunmamış konsültasyon sayısı getirilemedi:', error);
    }
  };

  // Unread count'u getir
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Tab değiştiğinde unread count'u güncelle (sadece gelen konsültasyonlar tab'ında)
  useEffect(() => {
    if (user && activeTab === 0) {
      fetchUnreadCount();
    }
  }, [user, activeTab]);

  // Sayfa odaklandığında unread count'u güncelle
  useEffect(() => {
    const handleFocus = () => {
      if (user && activeTab === 0) {
        fetchUnreadCount();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, activeTab]);

  // Header'daki unread count'u güncellemek için event listener
  useEffect(() => {
    const updateHeaderCount = () => {
      // Custom event ile header'ı bilgilendir
      window.dispatchEvent(new CustomEvent('consultationRead'));
    };

    window.addEventListener('consultationRead', updateHeaderCount);
    return () => window.removeEventListener('consultationRead', updateHeaderCount);
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [user, showArchived, showDeleted, activeTab]);

  const fetchConsultations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const allConsultations = await getConsultationInbox(showArchived, showDeleted);
      
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
      
      // Konsültasyon açıldığında okundu olarak işaretle (sadece gelen konsültasyonlar için)
      if (activeTab === 0 && consultation.type === 'incoming' && !consultation.isRead) {
        try {
          await markConsultationAsRead(consultation._id);
          // Konsültasyon listesini güncelle
          setConsultations(prev => prev.map(c => 
            c._id === consultation._id ? { ...c, isRead: true } : c
          ));
          // Unread count'u güncelle
          setUnreadCount(prev => Math.max(0, prev - 1));
          // Header'daki unread count'u güncelle
          window.dispatchEvent(new CustomEvent('consultationRead'));
        } catch (error) {
          console.error('Konsültasyon okundu olarak işaretlenemedi:', error);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setPatientDetailDialog(true);
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

  const handleMenuOpen = (event, consultation) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConsultationForMenu(consultation);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConsultationForMenu(null);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmDialog(true);
  };

  const handleArchiveClick = () => {
    setArchiveConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteConsultation(selectedConsultationForMenu._id);
      setSnackbar({
        open: true,
        message: 'Konsültasyon başarıyla silindi',
        severity: 'success'
      });
      setDeleteConfirmDialog(false);
      handleMenuClose();
      await fetchConsultations();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleArchiveConfirm = async () => {
    try {
      // Kullanıcının mevcut arşiv durumunu kontrol et
      const isCurrentlyArchived = selectedConsultationForMenu.type === 'sent' 
        ? selectedConsultationForMenu.senderArchived 
        : selectedConsultationForMenu.receiverArchived;
      
      const newArchivedState = !isCurrentlyArchived;
      await archiveConsultation(selectedConsultationForMenu._id, newArchivedState);
      setSnackbar({
        open: true,
        message: `Konsültasyon başarıyla ${newArchivedState ? 'arşivlendi' : 'arşivden çıkarıldı'}`,
        severity: 'success'
      });
      setArchiveConfirmDialog(false);
      handleMenuClose();
      await fetchConsultations();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleRestoreClick = () => {
    setRestoreConfirmDialog(true);
  };

  const handleRestoreConfirm = async () => {
    try {
      await restoreConsultation(selectedConsultationForMenu._id);
      setSnackbar({
        open: true,
        message: 'Konsültasyon başarıyla geri yüklendi',
        severity: 'success'
      });
      setRestoreConfirmDialog(false);
      handleMenuClose();
      await fetchConsultations();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllConsultationsAsRead();
      setSnackbar({
        open: true,
        message: 'Tüm konsültasyonlar okundu olarak işaretlendi',
        severity: 'success'
      });
      await fetchConsultations();
      // Unread count'u sıfırla
      setUnreadCount(0);
      // Header'daki unread count'u güncelle
      window.dispatchEvent(new CustomEvent('consultationRead'));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
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

  const getDaysUntilPermanentDelete = (deletedAt) => {
    if (!deletedAt) return null;
    const deletedDate = new Date(deletedAt);
    const thirtyDaysLater = new Date(deletedDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const now = new Date();
    const diffTime = thirtyDaysLater - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const renderPatientDetails = (patient) => {
    if (!patient) return null;

    return (
      <Box>
        <Grid container spacing={2}>
          {/* Temel Bilgiler */}
          <Grid item xs={12} md={6}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Temel Bilgiler</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Hasta Adı:</strong></Typography>
                    <Typography variant="body1">{patient.hastaAdi}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Hasta Sahibi:</strong></Typography>
                    <Typography variant="body1">{patient.hastaSahibi}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Protokol No:</strong></Typography>
                    <Typography variant="body1">{patient.protokolNo}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Tür:</strong></Typography>
                    <Typography variant="body1">{patient.tur}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Irk:</strong></Typography>
                    <Typography variant="body1">{patient.irk}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Cinsiyet:</strong></Typography>
                    <Typography variant="body1">{patient.cinsiyet}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Yaş:</strong></Typography>
                    <Typography variant="body1">{patient.yas} yaş</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Kilo:</strong></Typography>
                    <Typography variant="body1">{patient.kilo} kg</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>VKS:</strong></Typography>
                    <Typography variant="body1">{patient.vks}/9</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Klinik Bilgiler */}
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Klinik Bilgiler</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2"><strong>Anamnez:</strong></Typography>
                <Typography variant="body1" paragraph>{patient.anamnez}</Typography>
                
                {patient.radyolojikBulgular && (
                  <>
                    <Typography variant="body2"><strong>Radyolojik Bulgular:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.radyolojikBulgular}</Typography>
                  </>
                )}
                
                {patient.ultrasonografikBulgular && (
                  <>
                    <Typography variant="body2"><strong>Ultrasonografik Bulgular:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.ultrasonografikBulgular}</Typography>
                  </>
                )}
                
                {patient.tomografiBulgular && (
                  <>
                    <Typography variant="body2"><strong>Tomografi Bulguları:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.tomografiBulgular}</Typography>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Patoloji Bilgileri */}
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Patoloji Bilgileri</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {patient.patoloji && (
                  <>
                    <Typography variant="body2"><strong>Patoloji:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.patoloji}</Typography>
                  </>
                )}
                
                {patient.mikroskopisi && (
                  <>
                    <Typography variant="body2"><strong>Mikroskopisi:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.mikroskopisi}</Typography>
                  </>
                )}
                
                {patient.patolojikTeshis && (
                  <>
                    <Typography variant="body2"><strong>Patolojik Teşhis:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.patolojikTeshis}</Typography>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Tedavi Bilgileri */}
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Tedavi Bilgileri</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {patient.tedavi && (
                  <>
                    <Typography variant="body2"><strong>Tedavi:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.tedavi}</Typography>
                  </>
                )}
                
                {patient.recete && (
                  <>
                    <Typography variant="body2"><strong>Reçete:</strong></Typography>
                    <Typography variant="body1" paragraph>{patient.recete}</Typography>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Hemogram */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Hemogram</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Parametre</strong></TableCell>
                        <TableCell><strong>Değer</strong></TableCell>
                        <TableCell><strong>Parametre</strong></TableCell>
                        <TableCell><strong>Değer</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(patient.hemogram).map(([key, value], index) => {
                        if (index % 2 === 0) {
                          const nextKey = Object.keys(patient.hemogram)[index + 1];
                          const nextValue = nextKey ? patient.hemogram[nextKey] : '';
                          return (
                            <TableRow key={key}>
                              <TableCell>{key}</TableCell>
                              <TableCell>{value}</TableCell>
                              <TableCell>{nextKey}</TableCell>
                              <TableCell>{nextValue}</TableCell>
                            </TableRow>
                          );
                        }
                        return null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Biyokimya */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Biyokimya</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Parametre</strong></TableCell>
                        <TableCell><strong>Değer</strong></TableCell>
                        <TableCell><strong>Parametre</strong></TableCell>
                        <TableCell><strong>Değer</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(patient.biyokimya).map(([key, value], index) => {
                        if (index % 2 === 0) {
                          const nextKey = Object.keys(patient.biyokimya)[index + 1];
                          const nextValue = nextKey ? patient.biyokimya[nextKey] : '';
                          return (
                            <TableRow key={key}>
                              <TableCell>{key}</TableCell>
                              <TableCell>{value}</TableCell>
                              <TableCell>{nextKey}</TableCell>
                              <TableCell>{nextValue}</TableCell>
                            </TableRow>
                          );
                        }
                        return null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Biyopsi Bilgileri */}
          {patient.biyopsi && (
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Biyopsi Bilgileri</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>İİAB:</strong> {patient.biyopsi.iiab ? 'Evet' : 'Hayır'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>TUSE:</strong> {patient.biyopsi.tuse ? 'Evet' : 'Hayır'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>TRUCAT:</strong> {patient.biyopsi.trucat ? 'Evet' : 'Hayır'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2"><strong>Operasyon:</strong> {patient.biyopsi.operasyon ? 'Evet' : 'Hayır'}</Typography>
                    </Grid>
                    {patient.biyopsiNot && (
                      <Grid item xs={12}>
                        <Typography variant="body2"><strong>Biyopsi Notu:</strong></Typography>
                        <Typography variant="body1">{patient.biyopsiNot}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Konsültasyon Gelen Kutusu
        </Typography>
        <Box display="flex" gap={2}>
          {!showDeleted && !showArchived && (
            <Button
              variant="outlined"
              startIcon={<MailIcon />}
              onClick={handleMarkAllAsRead}
              color="primary"
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
          {!showDeleted && (
            <Button
              variant={showArchived ? "contained" : "outlined"}
              startIcon={<FolderIcon />}
              onClick={() => {
                setShowArchived(!showArchived);
                setShowDeleted(false);
              }}
            >
              {showArchived ? "Aktif Konsültasyonlar" : "Arşivlenmiş Konsültasyonlar"}
            </Button>
          )}
          {!showArchived && (
            <Button
              variant={showDeleted ? "contained" : "outlined"}
              startIcon={<DeleteIcon />}
              onClick={() => {
                setShowDeleted(!showDeleted);
                setShowArchived(false);
              }}
            >
              {showDeleted ? "Aktif Konsültasyonlar" : "Silinen Konsültasyonlar"}
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            icon={
              <Badge badgeContent={unreadCount} color="error">
                <MailIcon />
              </Badge>
            } 
            label={`Gelen Konsültasyonlar${unreadCount > 0 ? ` (${unreadCount})` : ''}`} 
          />
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
                button={!showDeleted}
                onClick={!showDeleted ? () => handleConsultationClick(consultation) : undefined}
                sx={{
                  ...(showDeleted ? { opacity: 0.7 } : {}),
                  ...(activeTab === 0 && consultation.type === 'incoming' && !consultation.isRead && !showArchived && !showDeleted ? {
                    backgroundColor: '#f0f8ff',
                    borderLeft: '4px solid #1877f2',
                    '&:hover': {
                      backgroundColor: '#e6f3ff',
                    }
                  } : {})
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, consultation);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={`/avatars/${activeTab === 0 
                      ? (consultation.senderDoctor?.avatar || 'default-avatar.svg')
                      : (consultation.receiverDoctor?.avatar || 'default-avatar.svg')
                    }`}
                  >
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="subtitle1" component="span">
                        {activeTab === 0 
                          ? `Dr. ${consultation.senderDoctor?.name || 'Bilinmeyen'}`
                          : `Dr. ${consultation.receiverDoctor?.name || 'Bilinmeyen'}`}
                      </Typography>
                      <Chip
                        size="small"
                        label={getStatusText(consultation.status)}
                        color={getStatusColor(consultation.status)}
                      />
                      {activeTab === 0 && consultation.type === 'incoming' && !consultation.isRead && !showArchived && !showDeleted && (
                        <Chip
                          size="small"
                          label="Yeni"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        Hasta: {consultation.patient ? `${consultation.patient.hastaAdi || 'Bilinmeyen'} (${consultation.patient.tur || 'Bilinmeyen'} - ${consultation.patient.irk || 'Bilinmeyen'})` : 'Hasta bilgisi bulunamadı'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="span" display="block">
                        {consultation.notes ? consultation.notes.substring(0, 100) + '...' : 'Not bulunamadı'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1} component="span">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {new Date(consultation.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                      {showDeleted && (
                        (() => {
                          const deletedAt = consultation.type === 'sent' 
                            ? consultation.senderDeletedAt 
                            : consultation.receiverDeletedAt;
                          const daysLeft = getDaysUntilPermanentDelete(deletedAt);
                          return daysLeft !== null && (
                            <Box display="flex" alignItems="center" gap={1} mt={1} component="span">
                              <DeleteIcon fontSize="small" color="error" />
                              <Typography variant="caption" color="error" component="span">
                                {daysLeft > 0 
                                  ? `${daysLeft} gün sonra kalıcı olarak silinecek`
                                  : 'Bugün kalıcı olarak silinecek'
                                }
                              </Typography>
                            </Box>
                          );
                        })()
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* Menü */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {!showDeleted && (
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon sx={{ mr: 1 }} />
            Sil
          </MenuItem>
        )}
        {!showDeleted && (
          <MenuItem onClick={handleArchiveClick}>
            {selectedConsultationForMenu && (
              (selectedConsultationForMenu.type === 'sent' && selectedConsultationForMenu.senderArchived) ||
              (selectedConsultationForMenu.type === 'incoming' && selectedConsultationForMenu.receiverArchived)
            ) ? (
              <>
                <UnarchiveIcon sx={{ mr: 1 }} />
                Arşivden Çıkar
              </>
            ) : (
              <>
                <ArchiveIcon sx={{ mr: 1 }} />
                Arşivle
              </>
            )}
          </MenuItem>
        )}
        {showDeleted && (
          <MenuItem onClick={handleRestoreClick}>
            <ArchiveIcon sx={{ mr: 1 }} />
            Geri Yükle
          </MenuItem>
        )}
      </Menu>

      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
      >
        <DialogTitle>Konsültasyonu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu konsültasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Arşivleme Onay Dialog'u */}
      <Dialog
        open={archiveConfirmDialog}
        onClose={() => setArchiveConfirmDialog(false)}
      >
        <DialogTitle>
          {selectedConsultationForMenu && (
            (selectedConsultationForMenu.type === 'sent' && selectedConsultationForMenu.senderArchived) ||
            (selectedConsultationForMenu.type === 'incoming' && selectedConsultationForMenu.receiverArchived)
          ) 
            ? 'Arşivden Çıkar' 
            : 'Arşivle'
          }
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedConsultationForMenu && (
              (selectedConsultationForMenu.type === 'sent' && selectedConsultationForMenu.senderArchived) ||
              (selectedConsultationForMenu.type === 'incoming' && selectedConsultationForMenu.receiverArchived)
            )
              ? 'Bu konsültasyonu arşivden çıkarmak istediğinizden emin misiniz?'
              : 'Bu konsültasyonu arşivlemek istediğinizden emin misiniz?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveConfirmDialog(false)}>İptal</Button>
          <Button onClick={handleArchiveConfirm} color="primary" variant="contained">
            {selectedConsultationForMenu && (
              (selectedConsultationForMenu.type === 'sent' && selectedConsultationForMenu.senderArchived) ||
              (selectedConsultationForMenu.type === 'incoming' && selectedConsultationForMenu.receiverArchived)
            )
              ? 'Arşivden Çıkar'
              : 'Arşivle'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Geri Yükleme Onay Dialog'u */}
      <Dialog
        open={restoreConfirmDialog}
        onClose={() => setRestoreConfirmDialog(false)}
      >
        <DialogTitle>Konsültasyonu Geri Yükle</DialogTitle>
        <DialogContent>
          <Typography>
            Bu konsültasyonu geri yüklemek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreConfirmDialog(false)}>İptal</Button>
          <Button onClick={handleRestoreConfirm} color="primary" variant="contained">
            Geri Yükle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mesajlaşma Dialog'u */}
      <Dialog
        open={messageDialog}
        onClose={() => setMessageDialog(false)}
        maxWidth="md"
        fullWidth
        onOpen={() => {
          // Dialog açıldığında konsültasyonu okundu olarak işaretle
          if (selectedConsultation && activeTab === 0 && selectedConsultation.type === 'incoming' && !selectedConsultation.isRead) {
            markConsultationAsRead(selectedConsultation._id).then(() => {
              setConsultations(prev => prev.map(c => 
                c._id === selectedConsultation._id ? { ...c, isRead: true } : c
              ));
              // Unread count'u güncelle
              setUnreadCount(prev => Math.max(0, prev - 1));
            }).catch(error => {
              console.error('Konsültasyon okundu olarak işaretlenemedi:', error);
            });
          }
        }}
      >
        <DialogTitle>
          {selectedConsultation && (
            <>
              Hasta: {selectedConsultation.patient ? `${selectedConsultation.patient.hastaAdi || 'Bilinmeyen'} (${selectedConsultation.patient.tur || 'Bilinmeyen'} - ${selectedConsultation.patient.irk || 'Bilinmeyen'})` : 'Hasta bilgisi bulunamadı'}
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
              {selectedConsultation?.patient ? (
                <>
                  <Typography variant="body2">
                    <strong>Hasta Adı:</strong> {selectedConsultation.patient.hastaAdi || 'Bilinmeyen'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hasta Sahibi:</strong> {selectedConsultation.patient.hastaSahibi || 'Bilinmeyen'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tür:</strong> {selectedConsultation.patient.tur || 'Bilinmeyen'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Irk:</strong> {selectedConsultation.patient.irk || 'Bilinmeyen'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Yaş:</strong> {selectedConsultation.patient.yas || 'Bilinmeyen'} yaş
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cinsiyet:</strong> {selectedConsultation.patient.cinsiyet || 'Bilinmeyen'}
                  </Typography>
                  {selectedConsultation.patient.kilo && (
                    <Typography variant="body2">
                      <strong>Kilo:</strong> {selectedConsultation.patient.kilo} kg
                    </Typography>
                  )}
                  {selectedConsultation.patient.protokolNo && (
                    <Typography variant="body2">
                      <strong>Protokol No:</strong> {selectedConsultation.patient.protokolNo}
                    </Typography>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewPatientDetails(selectedConsultation.patient)}
                    sx={{ mt: 2 }}
                    size="small"
                  >
                    Hasta Detaylarını Görüntüle
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="error">
                  Hasta bilgisi bulunamadı
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

      {/* Hasta Detay Dialog'u */}
      <Dialog
        open={patientDetailDialog}
        onClose={() => setPatientDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicalServicesIcon />
            <Typography variant="h6">
              Hasta Detayları - {selectedPatient?.hastaAdi}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderPatientDetails(selectedPatient)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDetailDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Inbox;
