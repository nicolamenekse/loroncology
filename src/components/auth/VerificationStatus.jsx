import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

const VerificationStatus = ({ email, onResend }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setResendSuccess(true);
      setCooldown(60);
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setResendError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Check Your Email
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        We've sent a verification link to <strong>{email}</strong>.<br />
        Please check your inbox and click the link to verify your email address.
      </Typography>

      {resendSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Verification email sent successfully!
        </Alert>
      )}

      {resendError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {resendError}
        </Alert>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleResend}
        disabled={resendLoading || cooldown > 0}
        sx={{ mt: 2 }}
      >
        {resendLoading ? (
          <CircularProgress size={24} />
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          'Resend Verification Email'
        )}
      </Button>
    </Box>
  );
};

export default VerificationStatus;
