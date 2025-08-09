import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setError('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        
        // Email doğrulandıktan sonra otomatik giriş yap
        try {
          setAutoLoginInProgress(true);
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: searchParams.get('email'),
              password: searchParams.get('password') // Bu null olacak, backend'de özel işlem yapacağız
            })
          });

          const loginData = await loginResponse.json();

          if (!loginResponse.ok) {
            throw new Error(loginData.message || 'Otomatik giriş başarısız');
          }

          login(loginData.user, loginData.token);
          navigate('/'); // Ana sayfaya yönlendir
        } catch (loginErr) {
          console.error('Otomatik giriş hatası:', loginErr);
          // Otomatik giriş başarısız olursa normal login sayfasına yönlendir
          setTimeout(() => navigate('/login'), 2000);
        } finally {
          setAutoLoginInProgress(false);
        }
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 3 }} />
            <Typography variant="h6">
              Verifying your email...
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
              Email Başarıyla Doğrulandı!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {autoLoginInProgress 
                ? 'Otomatik giriş yapılıyor ve ana sayfaya yönlendiriliyorsunuz...'
                : 'Email adresiniz doğrulandı. Şimdi giriş yapabilirsiniz.'}
            </Typography>
            {autoLoginInProgress ? (
              <CircularProgress size={36} sx={{ mt: 2 }} />
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)'
                  }
                }}
              >
                Giriş Yap
              </Button>
            )}
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="body1" paragraph>
              Please try clicking the link from your email again or request a new verification email.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Back to Registration
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4, md: 8 }
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
