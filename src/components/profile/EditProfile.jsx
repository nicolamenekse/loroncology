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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, fetchUserProfile as fetchProfile } from '../../services/authService';
import { respondToConnectionRequest } from '../../services/colleagueService';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    mainSpecialty: '',
    subspecialties: []
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const data = await fetchProfile();
        console.log('Backend\'den gelen kullanıcı verisi:', data);
        setUser(data); // Backend'den gelen güncel kullanıcı bilgilerini sakla
        setFormData({
          mainSpecialty: data.mainSpecialty || '',
          subspecialties: data.subspecialties || []
        });
      } catch (err) {
        console.error('Profil yükleme hatası:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleMainSpecialtyChange = (event) => {
    setFormData({
      mainSpecialty: event.target.value,
      subspecialties: [] // Ana uzmanlık değişince alt uzmanlıkları sıfırla
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
      // Profil bilgilerini yeniden yükle
      const data = await fetchProfile();
      setUser(data); // Kullanıcı bilgilerini güncelle
      setFormData({
        mainSpecialty: data.mainSpecialty || '',
        subspecialties: data.subspecialties || []
      });
      setSuccess(`Bağlantı isteği ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
                   const response = await updateProfile({
               mainSpecialty: formData.mainSpecialty,
               subspecialties: formData.subspecialties,
               profileCompleted: true
             });
      setSuccess('Profil başarıyla güncellendi');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
          Profil Düzenle
        </Typography>

        <Divider sx={{ my: 3 }} />

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
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id="mainSpecialty-label">Ana Uzmanlık Alanı</InputLabel>
            <Select
              labelId="mainSpecialty-label"
              id="mainSpecialty"
              value={formData.mainSpecialty}
              label="Ana Uzmanlık Alanı"
              onChange={handleMainSpecialtyChange}
            >
              {Object.keys(subspecialtiesByMain).map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.mainSpecialty && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, color: '#2c3e50' }}>
                Alt Uzmanlık Alanları
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {formData.mainSpecialty === 'Temel Bilimler' && 'Klinik öncesi bilim dalları, araştırma ve eğitimde temel rol oynayan alanlar'}
                {formData.mainSpecialty === 'Klinik Bilimler' && 'Doğrudan teşhis, tedavi ve hasta yönetimiyle ilgili uzmanlık alanları'}
                {formData.mainSpecialty === 'Hayvan Türüne Göre Uzmanlıklar' && 'Belirli hayvan türleri üzerine uzmanlaşma alanları'}
                {formData.mainSpecialty === 'Saha ve Üretim Branşları' && 'Saha çalışmaları, üretim ve yönetim odaklı uzmanlık alanları'}
                {formData.mainSpecialty === 'Araştırma & Akademik Alanlar' && 'Araştırma, geliştirme ve akademik çalışma alanları'}
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <FormGroup>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {subspecialtiesByMain[formData.mainSpecialty].map((subspecialty) => (
                        <Chip
                          key={subspecialty}
                          label={subspecialty}
                          onClick={() => handleSubspecialtyChange(subspecialty)}
                          color={formData.subspecialties.includes(subspecialty) ? "primary" : "default"}
                          variant={formData.subspecialties.includes(subspecialty) ? "filled" : "outlined"}
                          sx={{ 
                            p: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              background: formData.subspecialties.includes(subspecialty) 
                                ? 'primary.dark' 
                                : 'rgba(0, 0, 0, 0.08)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </FormGroup>
              </Paper>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Seçtiğiniz alt uzmanlık alanları profilinizde görüntülenecek ve diğer hekimler tarafından görülebilecektir.
                  İstediğiniz zaman bu seçimleri güncelleyebilirsiniz.
                </Typography>
              </Alert>
            </>
          )}

          {/* Meslektaş İstekleri Bölümü */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
              Meslektaş İstekleri
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Debug bilgisi */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Debug: pendingRequests: {user?.pendingRequests?.length || 0}, 
                sentRequests: {user?.sentRequests?.length || 0}, 
                connections: {user?.connections?.length || 0}
              </Typography>
            </Alert>

            {/* Gelen İstekler */}
            {console.log('pendingRequests:', user?.pendingRequests)}
            {user?.pendingRequests?.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 500 }}>
                  Gelen İstekler
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {user.pendingRequests.map((request) => {
                    // Add null check for sender
                    if (!request.sender) {
                      console.warn('Request with null sender:', request);
                      return null; // Skip this request
                    }
                    
                    return (
                      <Box
                        key={request._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          '&:not(:last-child)': {
                            borderBottom: '1px solid #eee'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            Dr. {request.sender.name || 'İsimsiz Doktor'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.sender.mainSpecialty || 'Uzmanlık alanı belirtilmemiş'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleRespondRequest(request._id, 'accepted')}
                          >
                            Kabul Et
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleRespondRequest(request._id, 'rejected')}
                          >
                            Reddet
                          </Button>
                        </Box>
                      </Box>
                    );
                  }).filter(Boolean)} {/* Filter out null values */}
                </Paper>
              </Box>
            )}

            {/* Gönderilen İstekler */}
            {console.log('sentRequests:', user?.sentRequests)}
            {user?.sentRequests?.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 500 }}>
                  Gönderilen İstekler
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {user.sentRequests.map((request) => {
                    // Add null check for receiver
                    if (!request.receiver) {
                      console.warn('Request with null receiver:', request);
                      return null; // Skip this request
                    }
                    
                    return (
                      <Box
                        key={request._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          '&:not(:last-child)': {
                            borderBottom: '1px solid #eee'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            Dr. {request.receiver.name || 'İsimsiz Doktor'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.receiver.mainSpecialty || 'Uzmanlık alanı belirtilmemiş'}
                          </Typography>
                        </Box>
                        <Chip
                          label="Beklemede"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    );
                  }).filter(Boolean)} {/* Filter out null values */}
                </Paper>
              </Box>
            )}

            {/* Bağlantılar */}
            {console.log('connections:', user?.connections)}
            {user?.connections?.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#2c3e50', fontWeight: 500 }}>
                  Bağlantılarınız
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {user.connections.map((connection) => {
                    // Add null checks for sender and receiver
                    if (!connection.sender || !connection.receiver) {
                      console.warn('Connection with null sender or receiver:', connection);
                      return null; // Skip this connection
                    }
                    
                    const otherDoctor = connection.sender._id === user._id ? connection.receiver : connection.sender;
                    
                    // Additional check for otherDoctor
                    if (!otherDoctor) {
                      console.warn('OtherDoctor is null for connection:', connection);
                      return null; // Skip this connection
                    }
                    
                    return (
                      <Box
                        key={connection._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          '&:not(:last-child)': {
                            borderBottom: '1px solid #eee'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            Dr. {otherDoctor.name || 'İsimsiz Doktor'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {otherDoctor.mainSpecialty || 'Uzmanlık alanı belirtilmemiş'}
                          </Typography>
                        </Box>
                        <Chip
                          label="Bağlantılı"
                          color="success"
                          size="small"
                          variant="outlined"
                          icon={<CheckIcon />}
                        />
                      </Box>
                    );
                  }).filter(Boolean)} {/* Filter out null values */}
                </Paper>
              </Box>
            )}

            {!user?.pendingRequests?.length && !user?.sentRequests?.length && !user?.connections?.length && (
              <Alert severity="info">
                Henüz hiç meslektaş bağlantınız veya isteğiniz bulunmuyor.
                Meslektaşlar sayfasından diğer hekimlere bağlantı isteği gönderebilirsiniz.
              </Alert>
            )}
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                py: 1.5,
                px: 4,
                background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)'
                }
              }}
            >
              {saving ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfile;
