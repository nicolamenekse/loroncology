import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home as HomeIcon, 
  Person as PersonIcon, 
  Group as GroupIcon, 
  Mail as MailIcon, 
  Article as ArticleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Pets as PetsIcon
} from '@mui/icons-material';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box, 
  InputBase, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getPendingConnectionCount } from '../services/colleagueService';
import { getUnreadConsultationCount } from '../services/notificationService';

// Styled components for Facebook-like design
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#ffffff',
  color: '#1c1e21',
  boxShadow: '0 2px 4px rgba(0,0,0,.1)',
  borderBottom: '1px solid #dddfe2',
  position: 'fixed',
  top: 0,
  zIndex: 1300,
});

const StyledToolbar = styled(Toolbar)({
  minHeight: '56px',
  padding: '0 16px',
  '@media (min-width: 900px)': {
    padding: '0 24px',
  },
});

const LogoSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  color: '#1877f2',
  '&:hover': {
    opacity: 0.8,
  },
});

const SearchSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f0f2f5',
  borderRadius: '20px',
  padding: '8px 16px',
  margin: '0 16px',
  flex: 1,
  maxWidth: '400px',
  '@media (max-width: 900px)': {
    display: 'none',
  },
});

const SearchInput = styled(InputBase)({
  color: '#1c1e21',
  fontSize: '15px',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: 0,
    '&::placeholder': {
      color: '#65676b',
      opacity: 1,
    },
  },
});

const NavSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  '@media (max-width: 900px)': {
    display: 'none',
  },
});

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})(({ isActive }) => ({
  minWidth: '112px',
  height: '48px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '15px',
  fontWeight: 600,
  color: isActive ? '#1877f2' : '#65676b',
  backgroundColor: isActive ? '#e7f3ff' : 'transparent',
  '&:hover': {
    backgroundColor: isActive ? '#dbe7f2' : '#f0f2f5',
  },
  '& .MuiButton-startIcon': {
    marginRight: '4px',
  },
}));

const ActionSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ActionButton = styled(IconButton)({
  backgroundColor: '#f0f2f5',
  color: '#65676b',
  width: '40px',
  height: '40px',
  '&:hover': {
    backgroundColor: '#e4e6eb',
  },
});

const ProfileButton = styled(Button)({
  textTransform: 'none',
  borderRadius: '20px',
  padding: '8px 12px',
  backgroundColor: '#f0f2f5',
  color: '#1c1e21',
  '&:hover': {
    backgroundColor: '#e4e6eb',
  },
});

const MobileMenuButton = styled(IconButton)({
  display: 'none',
  '@media (max-width: 900px)': {
    display: 'flex',
  },
});

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingConnectionCount, setPendingConnectionCount] = useState(0);
  const [unreadConsultationCount, setUnreadConsultationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPendingConnectionCount();
      fetchUnreadConsultationCount();
      
      // Sayfa odaklandığında güncelle
      const handleFocus = () => {
        fetchPendingConnectionCount();
        fetchUnreadConsultationCount();
      };
      
      // Konsültasyon okunduğunda count'u güncelle
      const handleConsultationRead = () => {
        fetchUnreadConsultationCount();
      };
      
      window.addEventListener('focus', handleFocus);
      window.addEventListener('consultationRead', handleConsultationRead);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('consultationRead', handleConsultationRead);
      };
    }
  }, [user]);

  const fetchPendingConnectionCount = async () => {
    try {
      const { pendingCount: count } = await getPendingConnectionCount();
      setPendingConnectionCount(count);
    } catch (error) {
      console.error('Arkadaşlık istekleri sayısı getirilemedi:', error);
    }
  };

  const fetchUnreadConsultationCount = async () => {
    try {
      const { unreadCount: count } = await getUnreadConsultationCount();
      setUnreadConsultationCount(count);
    } catch (error) {
      console.error('Okunmamış konsültasyon sayısı getirilemedi:', error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: <HomeIcon />, protected: true },
    { path: '/yeni-hasta', label: 'Yeni Hasta', icon: <AddIcon />, protected: true },
    { path: '/hastalar', label: 'Hastalar', icon: <PersonIcon />, protected: true },
    { path: '/blog', label: 'Blog', icon: <ArticleIcon />, protected: false },
    { path: '/doctors', label: 'Meslektaşlar', icon: <GroupIcon />, protected: true },
    { 
      path: '/inbox', 
      label: 'Mesajlar', 
      icon: <MailIcon />, 
      protected: true,
      showBadge: true,
      badgeCount: unreadConsultationCount
    },
  ];

  const filteredNavItems = navItems.filter(item => !item.protected || user);

  return (
    <>
      <StyledAppBar>
        <StyledToolbar>
          {/* Logo Section */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <LogoSection>
              <PetsIcon sx={{ fontSize: 32, color: '#1877f2' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1877f2' }}>
                Loroncology
              </Typography>
            </LogoSection>
          </Link>

          {/* Search Section */}
          <SearchSection>
            <SearchIcon sx={{ color: '#65676b', mr: 1 }} />
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <SearchInput
                placeholder="Loroncology'de ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
              />
            </form>
          </SearchSection>

          {/* Navigation Section */}
          <NavSection>
            {filteredNavItems.map((item) => (
              <NavButton
                key={item.path}
                startIcon={
                  item.showBadge && item.badgeCount > 0 ? (
                    <Badge badgeContent={item.badgeCount} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )
                }
                isActive={isActiveRoute(item.path)}
                onClick={() => navigate(item.path)}
                sx={{ minWidth: isMobile ? '80px' : '112px' }}
              >
                {isMobile ? '' : item.label}
              </NavButton>
            ))}
          </NavSection>

          {/* Action Section */}
          <ActionSection>
            {user ? (
              <>
                <ProfileButton
                  onClick={handleProfileMenuOpen}
                  startIcon={
                    user.avatar ? (
                      <Avatar src={`/avatars/${user.avatar}`} sx={{ width: 24, height: 24 }} />
                    ) : (
                      <AccountCircleIcon />
                    )
                  }
                >
                  <Box sx={{ position: 'relative' }}>
                    {user.name}
                    {pendingConnectionCount > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: '#ff4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: '2px solid white'
                        }}
                      >
                        {pendingConnectionCount > 9 ? '9+' : pendingConnectionCount}
                      </Box>
                    )}
                  </Box>
                </ProfileButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                    }
                  }}
                >
                  <MenuItem onClick={() => { navigate('/profile/edit'); handleProfileMenuClose(); }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profil Düzenle
                  </MenuItem>
                  
                  {user.role === 'admin' && (
                    <MenuItem onClick={() => { navigate('/admin'); handleProfileMenuClose(); }}>
                      <ListItemIcon>
                        <GroupIcon fontSize="small" />
                      </ListItemIcon>
                      Admin Paneli
                    </MenuItem>
                  )}
                  
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <MailIcon fontSize="small" />
                    </ListItemIcon>
                    Çıkış Yap
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#1877f2',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: '#166fe5',
                    },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Kayıt Ol
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <MobileMenuButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </MobileMenuButton>
          </ActionSection>
        </StyledToolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#ffffff',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1877f2' }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List>
            {filteredNavItems.map((item) => (
              <ListItem
                key={item.path}
                button
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  backgroundColor: isActiveRoute(item.path) ? '#e7f3ff' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActiveRoute(item.path) ? '#dbe7f2' : '#f0f2f5',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActiveRoute(item.path) ? '#1877f2' : '#65676b' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ 
                    color: isActiveRoute(item.path) ? '#1877f2' : '#1c1e21',
                    fontWeight: isActiveRoute(item.path) ? 600 : 400,
                  }}
                />
              </ListItem>
            ))}
          </List>

          {user && (
            <>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem
                  button
                  onClick={() => {
                    navigate('/profile/edit');
                    setMobileMenuOpen(false);
                  }}
                  sx={{ borderRadius: '8px', mb: 0.5 }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profil Düzenle" />
                </ListItem>
                
                {user.role === 'admin' && (
                  <ListItem
                    button
                    onClick={() => {
                      navigate('/admin');
                      setMobileMenuOpen(false);
                    }}
                    sx={{ borderRadius: '8px', mb: 0.5 }}
                  >
                    <ListItemIcon>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText primary="Admin Paneli" />
                  </ListItem>
                )}
                
                <ListItem
                  button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  sx={{ borderRadius: '8px', mb: 0.5 }}
                >
                  <ListItemIcon>
                    <MailIcon />
                  </ListItemIcon>
                  <ListItemText primary="Çıkış Yap" />
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>

      {/* Spacer for fixed header */}
      <Box sx={{ height: '56px' }} />
    </>
  );
};

export default Header;
