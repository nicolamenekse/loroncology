import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField
} from '@mui/material';
import { updateProfile, fetchUserProfile as fetchProfile } from '../../services/authService';
import { respondToConnectionRequest, removeConnection } from '../../services/colleagueService';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { Person as PersonIcon, Edit as EditIcon, Group as GroupIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import AvatarSelector from '../AvatarSelector';

// Alt uzmanlık alanları
const subspecialtiesByMain = {
  'Temel Bilimler': [
    'Anatomi',
    'Histoloji & Embriyoloji',
    'Fizyoloji',
    'Biyokimya',
    'Mikrobiyoloji',
    'Parazitoloji',
    'Patoloji',
    'Farmakoloji & Toksikoloji',
    'Genetik',
    'Biyometri / İstatistik',
    'Veteriner Halk Sağlığı',
    'Besin Hijyeni ve Teknolojisi'
  ],
  'Klinik Bilimler': [
    'İç Hastalıkları (Small animal)',
    'İç Hastalıkları (Large animal)',
    'Cerrahi (Yumuşak doku)',
    'Cerrahi (Ortopedi)',
    'Cerrahi (Travmatoloji)',
    'Doğum ve Jinekoloji',
    'Anesteziyoloji & Reanimasyon',
    'Radyoloji & Görüntüleme',
    'Oftalmoloji',
    'Dermatoloji',
    'Onkoloji',
    'Dentoloji',
    'Kardiyoloji',
    'Nöroloji',
    'Egzotik Hayvan Hastalıkları'
  ],
  'Hayvan Türüne Göre Uzmanlıklar': [
    'Küçük Hayvan Hekimliği',
    'Büyük Hayvan Hekimliği',
    'Kanatlı Hayvan Hekimliği',
    'Su Ürünleri Hekimliği',
    'Yaban Hayatı ve Hayvanat Bahçesi Hekimliği'
  ],
  'Saha ve Üretim Branşları': [
    'Hayvan Besleme ve Beslenme Hastalıkları',
    'Zootekni',
    'Epidemiyoloji',
    'Suni Tohumlama ve Embriyo Transferi',
    'Çiftlik Yönetimi ve Hayvan Refahı',
    'Veteriner Halk Sağlığı ve Zoonozlar'
  ],
  'Araştırma & Akademik Alanlar': [
    'Veteriner Biyoteknoloji',
    'Veteriner Farmasötik Araştırmalar',
    'Hayvan Davranışları (Etoloji)',
    'Veteriner Eğitim Teknolojileri'
  ]
};

const EditProfile = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removingConnectionId, setRemovingConnectionId] = useState(null);
  const [connectionSearchQuery, setConnectionSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    mainSpecialty: '',
    subspecialties: [],
    avatar: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchProfile();
        setUser(userData);
        setFormData({
          mainSpecialty: userData.mainSpecialty || '',
          subspecialties: userData.subspecialties || [],
          profileCompleted: userData.profileCompleted || false,
          avatar: userData.avatar || ''
        });
      } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleMainSpecialtyChange = (event) => {
    setFormData({
      mainSpecialty: event.target.value,
      subspecialties: []
    });
  };

  const handleSubspecialtyChange = (subspecialty) => {
    setFormData(prev => ({
      ...prev,
      subspecialties: prev.subspecialties.includes(subspecialty)
        ? prev.subspecialties.filter(s => s !== subspecialty)
        : [...prev.subspecialties, subspecialty]
    }));
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await respondToConnectionRequest(requestId, status);
      
      // Bağlantı isteği yanıtlandıktan sonra kullanıcı verilerini yeniden çek
      const data = await fetchProfile();
      setUser(data);
      
      // Form state'ini güncellenmiş verilerle senkronize et
      setFormData({
        mainSpecialty: data.mainSpecialty || '',
        subspecialties: data.subspecialties || [],
        avatar: data.avatar || ''
      });
      
      setSuccess(`Bağlantı isteği ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}`);
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Bağlantı isteği yanıtlanırken bir hata oluştu');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    setRemovingConnectionId(connectionId);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemoveConnection = async () => {
    try {
      await removeConnection(removingConnectionId);
      
      // Bağlantı kaldırıldıktan sonra kullanıcı verilerini yeniden çek
      const data = await fetchProfile();
      setUser(data);
      
      // Form state'ini güncellenmiş verilerle senkronize et
      setFormData({
        mainSpecialty: data.mainSpecialty || '',
        subspecialties: data.subspecialties || [],
        avatar: data.avatar || ''
      });
      
      setSuccess('Bağlantı başarıyla kaldırıldı');
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setRemoveDialogOpen(false);
      setRemovingConnectionId(null);
    } catch (err) {
      setError(err.message || 'Bağlantı kaldırılırken bir hata oluştu');
      setRemoveDialogOpen(false);
      setRemovingConnectionId(null);
    }
  };

  const handleCancelRemoveConnection = () => {
    setRemoveDialogOpen(false);
    setRemovingConnectionId(null);
  };

  // Bağlantıları filtrele
  const filteredConnections = user?.connections?.filter((connection) => {
    if (!connection.sender || !connection.receiver) return false;
    
    const otherDoctor = connection.sender._id === user._id ? connection.receiver : connection.sender;
    if (!otherDoctor) return false;
    
    const searchLower = connectionSearchQuery.toLowerCase();
    return (
      otherDoctor.name?.toLowerCase().includes(searchLower) ||
      otherDoctor.mainSpecialty?.toLowerCase().includes(searchLower) ||
      otherDoctor.subspecialties?.some(sub => sub.toLowerCase().includes(searchLower))
    );
  }) || [];

  const handleAvatarSelect = (avatar) => {
    setFormData(prev => ({
      ...prev,
      avatar
    }));
  };

  const openAvatarSelector = () => {
    setAvatarSelectorOpen(true);
  };

  const closeAvatarSelector = () => {
    setAvatarSelectorOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    console.log('=== Profil Güncelleme Başlatılıyor ===');
    console.log('Gönderilecek veri:', {
      mainSpecialty: formData.mainSpecialty,
      subspecialties: formData.subspecialties,
      avatar: formData.avatar,
      profileCompleted: true
    });

    try {
      await updateProfile({
        mainSpecialty: formData.mainSpecialty,
        subspecialties: formData.subspecialties,
        avatar: formData.avatar,
        profileCompleted: true
      });
      
      console.log('Profil güncelleme API çağrısı başarılı, kullanıcı verileri yeniden çekiliyor...');
      
      // Profil güncelleme başarılı olduktan sonra kullanıcı verilerini yeniden çek
      const updatedUserData = await fetchProfile();
      console.log('Güncellenmiş kullanıcı verisi:', updatedUserData);
      
      setUser(updatedUserData);
      
      // Form state'ini güncellenmiş verilerle senkronize et
      const newFormData = {
        mainSpecialty: updatedUserData.mainSpecialty || '',
        subspecialties: updatedUserData.subspecialties || [],
        avatar: updatedUserData.avatar || ''
      };
      
      console.log('Form state güncelleniyor:', newFormData);
      setFormData(newFormData);
      
      setSuccess('Profil başarıyla güncellendi!');
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (user === null) { // Changed from loading to user === null
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Sol Panel - Profil Bilgileri */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar
                src={`/avatars/${formData.avatar}`}
                sx={{
                  width: 80,
                  height: 80,
                  border: '3px solid #EAECF0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#1877F2',
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={openAvatarSelector}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 700, mb: 1 }}>
                  Profil Düzenle
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Uzmanlık alanlarınızı ve profil bilgilerinizi güncelleyin
                </Typography>
              </Box>
              <IconButton
                sx={{
                  background: '#1877F2',
                  color: 'white',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    background: '#166FE0'
                  }
                }}
                onClick={openAvatarSelector}
              >
                <EditIcon />
              </IconButton>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Ana Uzmanlık Alanı Seçimi */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, mb: 3 }}>
                  Ana Uzmanlık Alanı
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
                  {Object.keys(subspecialtiesByMain).map((specialty) => (
                    <Paper
                      key={specialty}
                      elevation={formData.mainSpecialty === specialty ? 4 : 1}
                      sx={{
                        p: 2.5,
                        cursor: 'pointer',
                        border: formData.mainSpecialty === specialty ? '2px solid #1877F2' : '2px solid transparent',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        backgroundColor: formData.mainSpecialty === specialty ? '#F0F8FF' : 'white',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          borderColor: formData.mainSpecialty === specialty ? '#1877F2' : '#E0E0E0'
                        }
                      }}
                      onClick={() => handleMainSpecialtyChange({ target: { value: specialty } })}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: formData.mainSpecialty === specialty ? '#1877F2' : '#E0E0E0',
                            backgroundColor: formData.mainSpecialty === specialty ? '#1877F2' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {formData.mainSpecialty === specialty && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'white'
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: formData.mainSpecialty === specialty ? 600 : 500,
                            color: formData.mainSpecialty === specialty ? '#1877F2' : '#2c3e50'
                          }}
                        >
                          {specialty}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>

              {/* Alt Uzmanlık Alanları */}
              {formData.mainSpecialty && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, mb: 3 }}>
                    Alt Uzmanlık Alanları
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                      (Birden fazla seçebilirsiniz)
                    </Typography>
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, backgroundColor: '#FAFBFC' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {subspecialtiesByMain[formData.mainSpecialty].map((subspecialty) => (
                        <Chip
                          key={subspecialty}
                          label={subspecialty}
                          onClick={() => handleSubspecialtyChange(subspecialty)}
                          color={formData.subspecialties.includes(subspecialty) ? "primary" : "default"}
                          variant={formData.subspecialties.includes(subspecialty) ? "filled" : "outlined"}
                          sx={{ 
                            py: 1,
                            px: 1.5,
                            fontSize: '0.85rem',
                            fontWeight: formData.subspecialties.includes(subspecialty) ? 600 : 500,
                            transition: 'all 0.2s ease',
                            borderWidth: formData.subspecialties.includes(subspecialty) ? 2 : 1,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            },
                            '&.MuiChip-filledPrimary': {
                              backgroundColor: '#1877F2',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#166FE0'
                              }
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    {formData.subspecialties.length > 0 && (
                      <Box sx={{ mt: 3, p: 2, backgroundColor: '#E3F2FD', borderRadius: 1, border: '1px solid #BBDEFB' }}>
                        <Typography variant="body2" color="#1565C0" sx={{ fontWeight: 500, mb: 1 }}>
                          Seçilen Alt Uzmanlık Alanları ({formData.subspecialties.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {formData.subspecialties.map((sub) => (
                            <Chip
                              key={sub}
                              label={sub}
                              size="small"
                              color="primary"
                              variant="filled"
                              onDelete={() => handleSubspecialtyChange(sub)}
                              sx={{
                                backgroundColor: '#1976D2',
                                color: 'white',
                                fontSize: '0.75rem',
                                '& .MuiChip-deleteIcon': {
                                  color: 'white',
                                  '&:hover': {
                                    color: '#E3F2FD'
                                  }
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}

              {/* Kaydet Butonu */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || !formData.mainSpecialty}
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 180,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                    },
                    '&:disabled': {
                      background: '#E0E0E0',
                      color: '#9E9E9E'
                    }
                  }}
                >
                  {saving ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Kaydediliyor...
                    </Box>
                  ) : (
                    'Profili Güncelle'
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Panel - Meslektaş Bağlantıları */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: 'fit-content', backgroundColor: '#FAFBFC' }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#1877F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GroupIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Meslektaş Bağlantıları
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Profesyonel ağınızı yönetin
                </Typography>
              </Box>
            </Box>

            {/* Arama Alanı */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Meslektaş ara..."
                value={connectionSearchQuery}
                onChange={(e) => setConnectionSearchQuery(e.target.value)}
                placeholder="İsim, uzmanlık veya alt uzmanlık alanı..."
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.secondary', fontSize: '1.1rem' }}>
                      🔍
                    </Box>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1877F2'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1877F2',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Box>

            {/* Gelen İstekler */}
            {user?.pendingRequests?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#FF6B6B'
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                    Gelen İstekler ({user.pendingRequests.length})
                  </Typography>
                </Box>
                
                <List dense sx={{ p: 0 }}>
                  {user.pendingRequests.map((request) => {
                    if (!request.sender) return null;
                    
                    return (
                      <Paper
                        key={request._id}
                        elevation={1}
                        sx={{
                          mb: 1.5,
                          borderRadius: 2,
                          border: '1px solid #E0E0E0',
                          backgroundColor: 'white',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderColor: '#1877F2'
                          }
                        }}
                      >
                        <ListItem sx={{ p: 2 }}>
                          <ListItemAvatar>
                            <Avatar 
                              src={request.sender.avatar ? `/avatars/${request.sender.avatar}` : '/avatars/default-avatar.svg'}
                              sx={{ 
                                width: 48, 
                                height: 48,
                                border: '2px solid #E0E0E0'
                              }}
                            />
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={`Dr. ${request.sender.name}`}
                            secondary={request.sender.mainSpecialty}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: '#2c3e50' }}
                            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{
                                background: '#10B981',
                                color: 'white',
                                '&:hover': { background: '#059669' },
                                width: 32,
                                height: 32
                              }}
                              onClick={() => handleRespondRequest(request._id, 'accepted')}
                            >
                              <CheckIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{
                                background: '#EF4444',
                                color: 'white',
                                '&:hover': { background: '#DC2626' },
                                width: 32,
                                height: 32
                              }}
                              onClick={() => handleRespondRequest(request._id, 'rejected')}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </ListItem>
                      </Paper>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* Bağlantılar */}
            {filteredConnections.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#10B981'
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                    Bağlantılarınız ({filteredConnections.length})
                  </Typography>
                </Box>
                
                <List dense sx={{ p: 0 }}>
                  {filteredConnections.map((connection) => {
                    if (!connection.sender || !connection.receiver) return null;
                    
                    const otherDoctor = connection.sender._id === user._id ? connection.receiver : connection.sender;
                    if (!otherDoctor) return null;
                    
                    return (
                      <Paper
                        key={connection._id}
                        elevation={1}
                        sx={{
                          mb: 1.5,
                          borderRadius: 2,
                          border: '1px solid #E0E0E0',
                          backgroundColor: 'white',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderColor: '#1877F2'
                          }
                        }}
                      >
                        <ListItem sx={{ p: 2 }}>
                          <ListItemAvatar>
                            <Avatar 
                              src={otherDoctor.avatar ? `/avatars/${otherDoctor.avatar}` : '/avatars/default-avatar.svg'}
                              sx={{ 
                                width: 48, 
                                height: 48,
                                border: '2px solid #E0E0E0'
                              }}
                            />
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={`Dr. ${otherDoctor.name}`}
                            secondary={otherDoctor.mainSpecialty}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: '#2c3e50' }}
                            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                          
                          <IconButton
                            size="small"
                            sx={{
                              background: '#EF4444',
                              color: 'white',
                              '&:hover': { background: '#DC2626' },
                              width: 32,
                              height: 32
                            }}
                            onClick={() => handleRemoveConnection(connection._id)}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </ListItem>
                        
                        {/* Alt uzmanlık alanları */}
                        {otherDoctor.subspecialties?.length > 0 && (
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {otherDoctor.subspecialties.slice(0, 3).map((sub) => (
                                <Chip
                                  key={sub}
                                  label={sub}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 20,
                                    borderColor: '#E0E0E0',
                                    color: '#666'
                                  }}
                                />
                              ))}
                              {otherDoctor.subspecialties.length > 3 && (
                                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 0.5 }}>
                                  +{otherDoctor.subspecialties.length - 3} daha
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    );
                  })}
                </List>
              </Box>
            )}

            {!user?.pendingRequests?.length && filteredConnections.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#E3F2FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <GroupIcon sx={{ fontSize: 32, color: '#1976D2' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {connectionSearchQuery ? 'Arama kriterlerinize uygun bağlantı bulunamadı' : 'Henüz meslektaş bağlantınız bulunmuyor'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {connectionSearchQuery ? 'Farklı arama terimleri deneyin' : 'Meslektaşlarınızla bağlantı kurmaya başlayın'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Avatar Seçim Dialog'u */}
      <AvatarSelector
        open={avatarSelectorOpen}
        onClose={closeAvatarSelector}
        selectedAvatar={formData.avatar}
        onAvatarSelect={handleAvatarSelect}
        title="Profil Fotoğrafı Seç"
      />

      {/* Bağlantı Kaldırma Onay Dialog'u */}
      <Dialog
        open={removeDialogOpen}
        onClose={handleCancelRemoveConnection}
        aria-labelledby="remove-dialog-title"
        aria-describedby="remove-dialog-description"
      >
        <DialogTitle id="remove-dialog-title">Bağlantıyı Kaldır</DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-dialog-description">
            Bunu yapmak istediğinize emin misiniz? Bağlantınızı kaldırdığınızda konsültasyon isteği gönderemezsiniz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemoveConnection} color="primary">
            İptal
          </Button>
          <Button onClick={handleConfirmRemoveConnection} color="error" variant="contained">
            Kaldır
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditProfile;
