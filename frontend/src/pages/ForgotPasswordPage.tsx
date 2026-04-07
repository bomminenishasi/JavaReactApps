import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, TextField, Typography, Alert, CircularProgress,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axiosInstance from '../services/axiosInstance';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Card sx={{ width: 420, p: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <AccountBalanceIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>Reset Password</Typography>
            <Typography color="text.secondary" textAlign="center">
              Enter your email to receive a reset link
            </Typography>
          </Box>

          {success ? (
            <Alert severity="success">
              If an account exists with that email, you'll receive a reset link shortly.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                <TextField label="Email" type="email" fullWidth value={email}
                  onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            </>
          )}

          <Box mt={2} textAlign="center">
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">Back to login</Typography>
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
