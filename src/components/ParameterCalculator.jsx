import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Fab,
  Drawer,
  Tooltip
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const CalculatorPaper = styled(Paper)(({ theme }) => ({
  width: '320px',
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const ParameterInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: theme.spacing(1),
    fontSize: '0.875rem',
    '& input': {
      padding: '8px 12px',
    },
    '&:hover': {
      backgroundColor: '#fafafa',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
  }
}));

const ParameterCalculator = ({ formData, handleParameterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const renderHemogramInputs = () => (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
          Lökosit Parametreleri
        </Typography>
      </Grid>
      {[
        'WBC', 'Neu#', 'Lym#', 'Mon#', 'Eos#',
        'Neu%', 'Lym%', 'Mon%', 'Eos%'
      ].map((param) => (
        <Grid item xs={6} key={param}>
          <ParameterInput
            fullWidth
            size="small"
            label={param}
            value={formData.hemogram[param] || ''}
            onChange={handleParameterChange('hemogram', param)}
            variant="outlined"
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
          Eritrosit Parametreleri
        </Typography>
      </Grid>
      {[
        'RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC',
        'RDW-CV', 'RDW-SD'
      ].map((param) => (
        <Grid item xs={6} key={param}>
          <ParameterInput
            fullWidth
            size="small"
            label={param}
            value={formData.hemogram[param] || ''}
            onChange={handleParameterChange('hemogram', param)}
            variant="outlined"
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
          Trombosit Parametreleri
        </Typography>
      </Grid>
      {[
        'PLT', 'MPV', 'PDW', 'PCT'
      ].map((param) => (
        <Grid item xs={6} key={param}>
          <ParameterInput
            fullWidth
            size="small"
            label={param}
            value={formData.hemogram[param] || ''}
            onChange={handleParameterChange('hemogram', param)}
            variant="outlined"
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderBiyokimyaInputs = () => (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
          Protein Parametreleri
        </Typography>
      </Grid>
      {[
        'TP', 'ALB', 'GLD', 'A/G'
      ].map((param) => (
        <Grid item xs={6} key={param}>
          <ParameterInput
            fullWidth
            size="small"
            label={param}
            value={formData.biyokimya[param] || ''}
            onChange={handleParameterChange('biyokimya', param)}
            variant="outlined"
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
          Karaciğer Enzimleri
        </Typography>
      </Grid>
      {[
        'TBIL', 'ALT', 'AST', 'AST/ALT', 'GGT', 'ALP', 'TBA'
      ].map((param) => (
        <Grid item xs={6} key={param}>
          <ParameterInput
            fullWidth
            size="small"
            label={param}
            value={formData.biyokimya[param] || ''}
            onChange={handleParameterChange('biyokimya', param)}
            variant="outlined"
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666', fontWeight: 600, fontSize: '0.8rem' }}>
          Diğer Parametreler
        </Typography>
      </Grid>
      {[
        'CK', 'AMY', 'TG', 'CHOL', 'GLU', 'CRE', 'BUN', 'BUN/CRE',
        'tCO2', 'Ca', 'P', 'Ca*P', 'Mg'
      ].map((param) => (
        <Grid item xs={6} key={param}>
          <ParameterInput
            fullWidth
            size="small"
            label={param}
            value={formData.biyokimya[param] || ''}
            onChange={handleParameterChange('biyokimya', param)}
            variant="outlined"
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Box sx={{ 
        position: 'fixed',
        left: 200,
        top: 70,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Paper
          elevation={3}
          sx={{
            padding: '4px 12px',
            backgroundColor: '#1976D2',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          Hemogram<br/>Biyokimya
        </Paper>
        <Tooltip title="Parametre Hesaplayıcıyı Aç" placement="right">
          <Fab
            color="primary"
            size="medium"
            onClick={toggleDrawer}
            sx={{
              bgcolor: '#2196F3',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                bgcolor: '#1976D2',
                boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
              }
            }}
          >
            <CalculateIcon />
          </Fab>
        </Tooltip>
      </Box>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: 320,
            mt: '64px', // Üst boşluk
            height: 'calc(100% - 64px)', // Yükseklik ayarı
          }
        }}
      >
        <CalculatorPaper elevation={0}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Typography variant="h6" component="h3" sx={{ 
                color: '#2196F3', 
                fontWeight: 600,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CalculateIcon fontSize="small" />
                Laboratuvar Parametreleri
              </Typography>
              <IconButton onClick={toggleDrawer} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="body2" sx={{ 
              color: '#666',
              fontSize: '0.85rem',
              bgcolor: '#e3f2fd',
              p: 1.5,
              borderRadius: 1,
              border: '1px dashed #90caf9'
            }}>
              Bu panelde hemogram ve biyokimya değerlerini hızlıca girebilirsiniz. 
              Değerler otomatik olarak hasta formuna kaydedilecektir.
            </Typography>
          </Box>
          
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 2,
              minHeight: '40px',
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                fontSize: '0.9rem',
                minHeight: '40px',
                textTransform: 'none',
                fontWeight: 500,
                color: '#666',
                '&.Mui-selected': {
                  color: '#2196F3',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2196F3',
                height: '3px'
              }
            }}
          >
            <Tab label="Hemogram" />
            <Tab label="Biyokimya" />
          </Tabs>

          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            px: 1
          }}>
            {currentTab === 0 ? renderHemogramInputs() : renderBiyokimyaInputs()}
          </Box>
        </CalculatorPaper>
      </Drawer>
    </>
  );
};

export default ParameterCalculator;
