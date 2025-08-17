import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Skeleton,
  Divider,
  IconButton,
  Alert,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  LocalHospital as LocalHospitalIcon,
  Mail as MailIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentPatients: [],
    recentBlogs: [],
    consultations: [],
    colleagues: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

    const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      // Gerçek API çağrıları
      const [patientsResponse, consultationsResponse, blogsResponse, colleaguesResponse] = await Promise.all([
        fetch('/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/consultations/inbox', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/blogs', {
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/colleagues/connections', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // API yanıtlarını logla
      console.log('API yanıtları:', {
        patients: { status: patientsResponse.status, ok: patientsResponse.ok },
        consultations: { status: consultationsResponse.status, ok: consultationsResponse.ok },
        blogs: { status: blogsResponse.status, ok: blogsResponse.ok },
        colleagues: { status: colleaguesResponse.status, ok: colleaguesResponse.ok }
      });

      // Hasta verilerini işle
      let recentPatients = [];
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        console.log('Hasta verileri alındı:', patientsData);
        
                 recentPatients = patientsData
           .filter(patient => patient && patient._id) // Null check
           .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
           .slice(0, 3)
           .map(patient => ({
            id: patient._id,
            name: patient.hastaAdi || 'İsim Belirtilmemiş',
            type: patient.tur || 'Tür Belirtilmemiş',
            protocol: patient.protokolNo || 'Protokol Belirtilmemiş',
            date: patient.createdAt || patient.updatedAt
          }));
        
        console.log('İşlenmiş hasta verileri:', recentPatients);
      } else {
        console.warn('Hasta verileri alınamadı:', patientsResponse.status);
      }

      // Konsültasyon verilerini işle
      let consultations = [];
      if (consultationsResponse.ok) {
        const consultationsData = await consultationsResponse.json();
        console.log('Konsültasyon verileri alındı:', consultationsData);
        console.log('Toplam konsültasyon sayısı:', consultationsData.length);
        
        // Her konsültasyonun detaylarını logla
        consultationsData.forEach((consultation, index) => {
          console.log(`Konsültasyon ${index + 1}:`, {
            id: consultation._id,
            type: consultation.type,
            status: consultation.status,
            senderDoctor: consultation.senderDoctor,
            receiverDoctor: consultation.receiverDoctor,
            patient: consultation.patient,
            createdAt: consultation.createdAt,
            // ID karşılaştırması için
            senderDoctorId: consultation.senderDoctor?._id,
            receiverDoctorId: consultation.receiverDoctor?._id,
            currentUserId: user?._id,
            isReceiver: consultation.receiverDoctor?._id === user?._id
          });
        });
        
        // Sadece gelen konsültasyonları filtrele (receiver olarak)
        const incomingConsultations = consultationsData.filter(consultation => {
          // Konsültasyonun alıcısı (receiver) mevcut kullanıcı mı?
          const isIncoming = consultation.receiverDoctor?._id === user?._id;
          
          console.log(`Konsültasyon ${consultation._id} gelen mi?`, isIncoming, {
            type: consultation.type,
            receiverDoctorId: consultation.receiverDoctor?._id,
            currentUserId: user?._id,
            isIncoming
          });
          
          return isIncoming;
        });
        
        console.log('Gelen konsültasyonlar filtrelendi:', incomingConsultations);
        console.log('Gelen konsültasyon sayısı:', incomingConsultations.length);
        
        consultations = incomingConsultations
          .filter(consultation => {
            // Sadece bekleyen ve kabul edilen konsültasyonları göster (hem Türkçe hem İngilizce)
            const isValidStatus = consultation.status === 'beklemede' || consultation.status === 'kabul' || 
                                 consultation.status === 'pending' || consultation.status === 'accepted';
            console.log(`Konsültasyon ${consultation._id} geçerli durum mu?`, isValidStatus, {
              status: consultation.status,
              consultation: consultation
            });
            return consultation && consultation._id && isValidStatus;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(consultation => {
            console.log('İşlenen konsültasyon:', consultation);
            return {
              id: consultation._id,
              doctorName: consultation.senderDoctor?.name || 'Dr. Bilinmeyen',
              patientName: consultation.patient?.hastaAdi || 'Hasta Bilinmeyen',
              status: consultation.status,
              date: consultation.createdAt,
              doctorAvatar: consultation.senderDoctor?.avatar || 'default-avatar.svg'
            };
          });
        
        console.log('İşlenmiş konsültasyon verileri:', consultations);
        console.log('Final konsültasyon sayısı:', consultations.length);
      } else {
        console.warn('Konsültasyon verileri alınamadı:', consultationsResponse.status);
      }

      // Blog verilerini işle
      let recentBlogs = [];
      if (blogsResponse.ok) {
        const blogsResponseData = await blogsResponse.json();
        console.log('Blog response data:', blogsResponseData);
        
        // Yeni format: { blogs: [...], pagination: {...} } veya eski format: [...]
        const blogsData = blogsResponseData.blogs || blogsResponseData;
        
        if (Array.isArray(blogsData)) {
          recentBlogs = blogsData
            .filter(blog => 
              blog && 
              blog._id && 
              blog.status === 'published'
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(blog => ({
              id: blog._id,
              title: blog.title || 'Başlık Belirtilmemiş',
              summary: blog.summary || 'Özet belirtilmemiş',
              tags: blog.tags || [],
              category: blog.category || 'Kategori Belirtilmemiş',
              slug: blog.slug || blog._id
            }));
        } else {
          console.warn('Blog verileri array formatında değil:', blogsData);
        }
      } else {
        console.warn('Blog verileri alınamadı:', blogsResponse.status);
      }

      // Meslektaş verilerini işle
      let colleagues = [];
      if (colleaguesResponse.ok) {
        const colleaguesData = await colleaguesResponse.json();
        console.log('Meslektaş verileri alındı:', colleaguesData);
        console.log('Mevcut kullanıcı ID:', user?._id);
        
        colleagues = colleaguesData
          .filter(connection => 
            connection.status === 'accepted' && 
            connection.sender && 
            connection.receiver
          )
          .map(connection => {
            try {
              console.log('İşlenen bağlantı:', connection);
              
              // Bağlantıda hangi kullanıcı biz değilse onu al
              const colleague = connection.sender._id === user?._id 
                ? connection.receiver 
                : connection.sender;
              
              console.log('Seçilen meslektaş:', colleague);
              
              // Null check ekle
              if (!colleague || !colleague._id) {
                console.warn('Geçersiz meslektaş verisi:', connection);
                return null;
              }
              
              return {
                id: colleague._id,
                name: colleague.name || 'İsim Belirtilmemiş',
                specialty: colleague.mainSpecialty || 'Uzmanlık Belirtilmemiş',
                avatar: colleague.avatar || 'default-avatar.svg'
              };
            } catch (error) {
              console.warn('Meslektaş verisi işlenirken hata:', error, connection);
              return null;
            }
          })
          .filter(Boolean) // null değerleri filtrele
          .slice(0, 5);
        
        console.log('İşlenmiş meslektaş verileri:', colleagues);
      } else {
        console.warn('Meslektaş verileri alınamadı:', colleaguesResponse.status);
      }

      setDashboardData({
        recentPatients,
        recentBlogs,
        consultations,
        colleagues
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err);
      console.error('Hata stack:', err.stack);
      
      // API hatalarını daha detaylı göster
      if (err.message) {
        setError(`Veri yükleme hatası: ${err.message}`);
      } else {
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      }
      
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'beklemede':
      case 'pending': return 'warning';
      case 'kabul':
      case 'accepted': return 'success';
      case 'ret':
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'beklemede':
      case 'pending': return 'Beklemede';
      case 'kabul':
      case 'accepted': return 'Kabul Edildi';
      case 'ret':
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };



     const renderSkeletonList = () => (
     <List>
       {[1, 2, 3].map((item) => (
        <ListItem key={item} sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Skeleton variant="circular" width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary={<Skeleton variant="text" width="60%" height={20} />}
            secondary={<Skeleton variant="text" width="40%" height={16} />}
          />
        </ListItem>
      ))}
    </List>
  );

  const renderEmptyState = (title, description, actionText, actionHandler, icon = null) => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      {icon && (
        <Box sx={{ mb: 2, opacity: 0.6 }}>
          {icon}
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '14px' }}>
        {description}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={actionHandler}
        sx={{ 
          textTransform: 'none',
          borderColor: '#D1D5DB',
          color: '#6B7280',
          '&:hover': {
            borderColor: '#9CA3AF',
            background: '#F9FAFB'
          }
        }}
      >
        {actionText}
      </Button>
    </Box>
  );

  const renderErrorState = (message, retryHandler) => (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message}
      </Alert>
      <Link
        component="button"
        variant="body2"
        onClick={retryHandler}
        sx={{ textDecoration: 'none', cursor: 'pointer' }}
      >
        Tekrar Dene
      </Link>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#F8FAFC',
      pt: 10, // Header için boşluk
      pb: 4
    }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
         <Box sx={{ 
           textAlign: 'center', 
           mb: 6,
           background: 'linear-gradient(135deg, #1877F2 0%, #00B5E2 100%)',
           borderRadius: '24px',
           p: 4,
           color: 'white',
           boxShadow: '0 4px 20px rgba(24, 119, 242, 0.15)'
         }}>
          <Avatar
            sx={{
               width: 64,
               height: 64,
               margin: '0 auto 1.5rem auto',
               background: 'rgba(255, 255, 255, 0.2)',
               backdropFilter: 'blur(10px)'
             }}
           >
             <LocalHospitalIcon sx={{ fontSize: 32 }} />
          </Avatar>
          
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{
              fontWeight: 700,
               fontSize: { xs: '1.75rem', md: '2.25rem' },
               mb: 1.5,
               textTransform: 'none'
             }}
           >
             LorOncology
          </Typography>
          
          <Typography 
             variant="h4" 
            component="h2" 
            sx={{
               fontWeight: 400,
               color: '#EAF4FF',
               mb: 4,
               fontSize: { xs: '1rem', md: '1.125rem' },
               textTransform: 'none'
            }}
          >
            Veteriner Onkoloji Hasta Takip Sistemi
          </Typography>

           <Box sx={{ 
             display: 'flex', 
             gap: { xs: 2, md: 3 }, 
             justifyContent: 'center', 
             flexWrap: 'wrap',
             mb: 4
           }}>
             <Button
               variant="contained"
               size="large"
               startIcon={<AddIcon />}
              onClick={() => navigate('/yeni-hasta')}
              sx={{
                 background: '#FFFFFF',
                 color: '#1877F2',
                 textTransform: 'none',
                 fontWeight: 600,
                 px: 4,
                 py: 1.5,
                 borderRadius: '12px',
                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                   background: '#F8FAFC',
                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                 }
               }}
             >
               Yeni Hasta Ekle
             </Button>
             
             <Button
               variant="outlined"
               size="large"
               onClick={() => navigate('/hastalar')}
               sx={{
                 borderColor: 'rgba(255, 255, 255, 0.8)',
                 color: 'white',
                 textTransform: 'none',
                 fontWeight: 600,
                 px: 4,
                 py: 1.5,
                 borderRadius: '12px',
                 '&:hover': {
                   borderColor: 'white',
                   background: 'rgba(255, 255, 255, 0.1)'
                 }
               }}
             >
               Kayıtlı Hastalar
             </Button>
           </Box>

           {/* İstatistik Çipleri */}
           <Box sx={{ 
             display: 'flex', 
             gap: 2, 
             flexWrap: 'wrap', 
             justifyContent: 'center' 
           }}>
             <Chip
               icon={<PetsIcon />}
               label={`Toplam Hasta: ${dashboardData.recentPatients.length}`}
               variant="outlined"
                sx={{ 
                 borderRadius: '20px',
                 borderColor: 'rgba(255, 255, 255, 0.3)',
                 color: 'white',
                 background: 'rgba(255, 255, 255, 0.1)',
                 '& .MuiChip-icon': { color: 'white' }
               }}
             />
             <Chip
               icon={<MailIcon />}
               label={`Bekleyen Konsültasyon: ${dashboardData.consultations.filter(c => c.status === 'beklemede').length}`}
               variant="outlined"
               sx={{ 
                 borderRadius: '20px',
                 borderColor: 'rgba(255, 255, 255, 0.3)',
                 color: 'white',
                 background: 'rgba(255, 255, 255, 0.1)',
                 '& .MuiChip-icon': { color: 'white' }
               }}
             />
             <Chip
               icon={<ArticleIcon />}
               label={`Blog Yazısı: ${dashboardData.recentBlogs.length}`}
               variant="outlined"
               sx={{ 
                 borderRadius: '20px',
                 borderColor: 'rgba(255, 255, 255, 0.3)',
                 color: 'white',
                 background: 'rgba(255, 255, 255, 0.1)',
                 '& .MuiChip-icon': { color: 'white' }
               }}
             />
           </Box>
         </Box>

                 {/* Dashboard Grid */}
         <Grid container spacing={{ xs: 2, md: 3 }}>
           {/* Sol Üst: Son Hastalar */}
           <Grid item xs={12} lg={6}>
             <Card sx={{ 
               borderRadius: '20px',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
               height: '100%',
               border: '1px solid #EAECF0'
             }}>
               <CardHeader
                 avatar={<PetsIcon sx={{ color: '#1877F2', fontSize: 24 }} />}
                 title="Son Hastalar"
                 titleTypographyProps={{ 
                   variant: 'h4', 
                   fontWeight: 600,
                   color: '#101828',
                   fontSize: '20px'
                 }}
                 action={
                   <Button
                     size="small"
                     onClick={() => navigate('/hastalar')}
                     sx={{ 
                       textTransform: 'none',
                       color: '#667085',
                       fontSize: '14px',
                       fontWeight: 500,
                       '&:hover': { 
                         background: 'rgba(102, 112, 133, 0.08)',
                         textDecoration: 'underline'
                       }
                     }}
                   >
                     Tümünü Gör
                   </Button>
                 }
                 sx={{ pb: 1, px: 3, pt: 3 }}
               />
               <Divider sx={{ borderColor: '#EAECF0', mx: 3 }} />
               
               <CardContent sx={{ pt: 2, px: 3, pb: 3 }}>
                {loading ? (
                  renderSkeletonList()
                ) : error ? (
                  renderErrorState(error, fetchDashboardData)
                ) : dashboardData.recentPatients.length === 0 ? (
                                     renderEmptyState(
                     'Henüz hasta kaydı yok',
                     'İlk hasta kaydınızı oluşturmaya başlayın',
                     'Yeni Hasta Ekle',
                     () => navigate('/yeni-hasta'),
                     <PetsIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                   )
                ) : (
                                     <List sx={{ pt: 0 }}>
                     {dashboardData.recentPatients.slice(0, 3).map((patient) => (
                       <ListItem
                         key={patient.id}
                         button
                         onClick={() => navigate(`/hasta/${patient.id}`)}
                sx={{
                           px: 2,
                           py: 2,
                           borderRadius: '12px',
                           mb: 1,
                           cursor: 'pointer',
                           transition: 'all 0.2s ease',
                           '&:hover': {
                             background: '#F9FAFB',
                             transform: 'translateX(4px)'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <PetsIcon sx={{ color: '#667085', fontSize: 20 }} />
                         </ListItemIcon>
                         <ListItemText
                           primary={
                             <Typography
                               variant="body1"
                               fontWeight={600}
                               color="#101828"
                               sx={{ mb: 0.5 }}
                             >
                               {patient.name}
                             </Typography>
                           }
                           secondary={
                             <Typography
                               variant="body2"
                               color="#667085"
                               sx={{ fontSize: '13px', mb: 0.5 }}
                             >
                               {patient.type}
                             </Typography>
                           }
                         />
                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                           <Typography
                             variant="caption"
                             color="#98A2B3"
                             sx={{ display: 'block', mb: 0.5 }}
                           >
                             Protokol: {patient.protocol}
              </Typography>
              <Typography
                             variant="caption"
                             color="#98A2B3"
                           >
                             {formatDate(patient.date)}
              </Typography>
            </Box>
                         <ChevronRightIcon 
                           sx={{ 
                             color: '#667085',
                             transition: 'all 0.2s ease',
                             '&:hover': { color: '#1877F2' }
                           }} 
                         />
                       </ListItem>
                     ))}
                   </List>
                )}
              </CardContent>
            </Card>
          </Grid>

                     {/* Sağ Üst: Blogdan Son Yazılar */}
           <Grid item xs={12} lg={6}>
             <Card sx={{ 
               borderRadius: '20px',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
               height: '100%',
               border: '1px solid #EAECF0'
             }}>
               <CardHeader
                 avatar={<ArticleIcon sx={{ color: '#1877F2', fontSize: 24 }} />}
                 title="Blogdan Son Yazılar"
                 titleTypographyProps={{ 
                   variant: 'h4', 
                   fontWeight: 600,
                   color: '#101828',
                   fontSize: '20px'
                 }}
                 action={
                   <Button
                     size="small"
                     onClick={() => navigate('/blog')}
                     sx={{ 
                       textTransform: 'none',
                       color: '#667085',
                       fontSize: '14px',
                       fontWeight: 500,
                       '&:hover': { 
                         background: 'rgba(102, 112, 133, 0.08)',
                         textDecoration: 'underline'
                       }
                     }}
                   >
                     Tümünü Gör
                   </Button>
                 }
                 sx={{ pb: 1, px: 3, pt: 3 }}
               />
               <Divider sx={{ borderColor: '#EAECF0', mx: 3 }} />
               
               <CardContent sx={{ pt: 2, px: 3, pb: 3 }}>
                {loading ? (
                  renderSkeletonList()
                ) : error ? (
                  renderErrorState(error, fetchDashboardData)
                ) : dashboardData.recentBlogs.length === 0 ? (
                                     renderEmptyState(
                     'Henüz blog yazısı yok',
                     'İlk blog yazınızı oluşturmaya başlayın',
                     'Blog Yazısı Oluştur',
                     () => navigate('/blog/yeni'),
                     <ArticleIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                   )
                ) : (
                                     <List sx={{ pt: 0 }}>
                     {dashboardData.recentBlogs.slice(0, 5).map((blog) => (
                       <ListItem
                         key={blog.id}
                         button
                         onClick={() => navigate(`/blog/${blog.slug}`)}
              sx={{
                           px: 2,
                           py: 2,
                           borderRadius: '12px',
                           mb: 1,
                cursor: 'pointer',
                           transition: 'all 0.2s ease',
                '&:hover': {
                             background: '#F9FAFB',
                             transform: 'translateX(4px)'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <ArticleIcon sx={{ color: '#667085', fontSize: 20 }} />
                         </ListItemIcon>
                         <ListItemText
                           primary={
                             <Typography
                               variant="body1"
                               fontWeight={600}
                               color="#101828"
                               sx={{ mb: 1 }}
                             >
                               {blog.title}
                             </Typography>
                           }
                           secondary={
                             <Typography 
                               variant="body2" 
                               color="#667085" 
                sx={{ 
                                 mb: 1.5,
                                 display: '-webkit-box',
                                 WebkitLineClamp: 1,
                                 WebkitBoxOrient: 'vertical',
                                 overflow: 'hidden'
                               }}
                             >
                               {blog.summary}
                             </Typography>
                           }
                         />
                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                             {blog.tags.slice(0, 2).map((tag, index) => (
                               <Chip
                                 key={index}
                                 label={tag}
                                 size="small"
                                 variant="outlined"
                                 sx={{
                                   fontSize: '11px',
                                   height: '18px',
                                   borderRadius: '9999px',
                                   borderColor: '#E5E7EB',
                                   color: '#6B7280',
                                   background: '#F9FAFB',
                                   '& .MuiChip-label': { px: 1 }
                                 }}
                               />
                             ))}
                           </Box>
                         </Box>
                         <ChevronRightIcon 
                           sx={{ 
                             color: '#667085',
                             transition: 'all 0.2s ease',
                             '&:hover': { color: '#1877F2' }
                           }} 
                         />
                       </ListItem>
                     ))}
                   </List>
                )}
              </CardContent>
            </Card>
          </Grid>

                     {/* Alt Sol: Gelen Konsültasyonlar */}
           <Grid item xs={12} lg={6}>
             <Card sx={{ 
               borderRadius: '20px',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
               height: '100%',
               border: '1px solid #EAECF0'
             }}>
               <CardHeader
                 avatar={<MailIcon sx={{ color: '#1877F2', fontSize: 24 }} />}
                 title="Gelen Konsültasyonlar"
                 titleTypographyProps={{ 
                   variant: 'h4', 
                   fontWeight: 600,
                   color: '#101828',
                   fontSize: '20px'
                 }}
                 action={
                   <Button
                     size="small"
                     onClick={() => navigate('/inbox')}
                     sx={{ 
                       textTransform: 'none',
                       color: '#667085',
                       fontSize: '14px',
                       fontWeight: 500,
                       '&:hover': { 
                         background: 'rgba(102, 112, 133, 0.08)',
                         textDecoration: 'underline'
                       }
                     }}
                   >
                     Tümünü Gör
                   </Button>
                 }
                 sx={{ pb: 1, px: 3, pt: 3 }}
               />
               <Divider sx={{ borderColor: '#EAECF0', mx: 3 }} />
               
               <CardContent sx={{ pt: 2, px: 3, pb: 3 }}>
                {loading ? (
                  renderSkeletonList()
                ) : error ? (
                  renderErrorState(error, fetchDashboardData)
                                 ) : dashboardData.consultations.length === 0 ? (
                                       renderEmptyState(
                      'Henüz gelen konsültasyon yok',
                      'Meslektaşlarınızdan konsültasyon istekleri burada görünecek',
                      'Konsültasyon Başlat',
                      () => navigate('/inbox'),
                      <MailIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                    )
                ) : (
                                     <List sx={{ pt: 0 }}>
                     {dashboardData.consultations.slice(0, 3).map((consultation) => (
                       <ListItem
                         key={consultation.id}
                         button
                         onClick={() => navigate(`/inbox`)}
                         sx={{
                           px: 2,
                           py: 2,
                           borderRadius: '12px',
                           mb: 1,
                           cursor: 'pointer',
                           transition: 'all 0.2s ease',
                           '&:hover': {
                             background: '#F9FAFB',
                             transform: 'translateX(4px)'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <Avatar 
                             src={`/avatars/${consultation.doctorAvatar}`}
                sx={{
                               width: 36, 
                               height: 36, 
                               fontSize: '14px',
                               background: '#E5E7EB',
                               color: '#6B7280'
                             }}
                           >
                             {consultation.doctorName?.charAt(0)}
                           </Avatar>
                         </ListItemIcon>
                         <ListItemText
                           primary={
              <Typography
                variant="body1"
                               fontWeight={600}
                               color="#101828"
                               sx={{ mb: 0.5 }}
                             >
                               {consultation.doctorName}
                             </Typography>
                           }
                           secondary={
                             <Typography
                               variant="body2"
                               color="#667085"
                               sx={{ fontSize: '13px' }}
                             >
                               {consultation.patientName}
                             </Typography>
                           }
                         />
                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                           <Typography
                             variant="caption"
                             color="#98A2B3"
                             sx={{ display: 'block', mb: 0.5 }}
                           >
                             {formatDate(consultation.date)}
                           </Typography>
                         </Box>
                         <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Chip
                             label={getStatusText(consultation.status)}
                             size="small"
                             color={getStatusColor(consultation.status)}
                             sx={{ 
                               height: '20px',
                               fontSize: '11px',
                               fontWeight: 500,
                               '& .MuiChip-label': { px: 1 }
                             }}
                           />
                           <ChevronRightIcon 
                             sx={{ 
                               color: '#667085',
                               transition: 'all 0.2s ease',
                               '&:hover': { color: '#1877F2' }
                             }} 
                           />
                         </Box>
                       </ListItem>
                     ))}
                   </List>
                )}
              </CardContent>
            </Card>
          </Grid>

                     {/* Alt Sağ: Meslektaşlar */}
           <Grid item xs={12} lg={6}>
             <Card sx={{ 
               borderRadius: '20px',
               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
               height: '100%',
               border: '1px solid #EAECF0'
             }}>
               <CardHeader
                 avatar={<GroupIcon sx={{ color: '#1877F2', fontSize: 24 }} />}
                 title="Meslektaşlar"
                 titleTypographyProps={{ 
                   variant: 'h4', 
                   fontWeight: 600,
                   color: '#101828',
                   fontSize: '20px'
                 }}
                 action={
                   <Button
                     size="small"
                     onClick={() => navigate('/doctors')}
                     sx={{ 
                       textTransform: 'none',
                       color: '#667085',
                       fontSize: '14px',
                       fontWeight: 500,
                       '&:hover': { 
                         background: 'rgba(102, 112, 133, 0.08)',
                         textDecoration: 'underline'
                       }
                     }}
                   >
                     Ağı Gör
                   </Button>
                 }
                 sx={{ pb: 1, px: 3, pt: 3 }}
               />
               <Divider sx={{ borderColor: '#EAECF0', mx: 3 }} />
               
               <CardContent sx={{ pt: 2, px: 3, pb: 3 }}>
                {loading ? (
                  renderSkeletonList()
                ) : error ? (
                  renderErrorState(error, fetchDashboardData)
                ) : dashboardData.colleagues.length === 0 ? (
                                                                           renderEmptyState(
                      'Henüz meslektaş bağlantınız yok',
                      'Meslektaşlarınızla bağlantı kurarak konsültasyon sistemini kullanmaya başlayın',
                      'Meslektaş Bul',
                      () => navigate('/doctors'),
                      <GroupIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                    )
                ) : (
                                     <List sx={{ pt: 0 }}>
                     {dashboardData.colleagues.slice(0, 5).map((colleague) => (
                       <ListItem
                         key={colleague.id}
                         sx={{
                           px: 2,
                           py: 2,
                           borderRadius: '12px',
                           mb: 1,
                           transition: 'all 0.2s ease',
                           '&:hover': {
                             background: '#F9FAFB'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <Avatar 
                             src={`/avatars/${colleague.avatar}`}
                sx={{
                               width: 36, 
                               height: 36, 
                               fontSize: '14px',
                               background: '#E5E7EB',
                               color: '#6B7280'
                             }}
                           >
                             {colleague.name?.charAt(0)}
                           </Avatar>
                         </ListItemIcon>
                         <ListItemText
                           primary={
                             <Typography
                               variant="body1"
                               fontWeight={600}
                               color="#101828"
                               sx={{ mb: 0.5 }}
                             >
                               {colleague.name}
                             </Typography>
                           }
                           secondary={
                             <Typography
                               variant="body2"
                               color="#667085"
                               sx={{ fontSize: '13px' }}
                             >
                               {colleague.specialty}
              </Typography>
                           }
                         />
                       </ListItem>
                     ))}
                   </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        
      </Container>

             {/* Mobil için Yüzen Yeni Hasta Butonu */}
        <Box 
          sx={{ 
           position: 'fixed',
           bottom: 24,
           right: 24,
           display: { xs: 'block', md: 'none' },
           zIndex: 1000
         }}
       >
         <Button
           variant="contained"
           startIcon={<AddIcon />}
           onClick={() => navigate('/yeni-hasta')}
            sx={{ 
             background: 'linear-gradient(135deg, #1877F2 0%, #00B5E2 100%)',
             color: 'white',
             borderRadius: '50px',
             px: 3,
             py: 1.5,
             boxShadow: '0 8px 32px rgba(24, 119, 242, 0.4)',
             textTransform: 'none',
             fontWeight: 600,
             transition: 'all 0.3s ease',
             '&:hover': {
               background: 'linear-gradient(135deg, #166FE0 0%, #0099CC 100%)',
               transform: 'translateY(-2px)',
               boxShadow: '0 12px 40px rgba(24, 119, 242, 0.5)'
             }
           }}
         >
           Yeni Hasta
         </Button>
        </Box>
    </Box>
  );
};

export default Home;