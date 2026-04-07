import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box, Button, Card, CardContent, TextField, Typography, Alert,
  CircularProgress, Grid,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { register as registerAction, clearError } from '../features/auth/authSlice';
import { RegisterRequest } from '../types';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
  phone: yup.string().optional(),
});

type FormData = RegisterRequest & { confirmPassword: string };

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = ({ confirmPassword, ...data }: FormData) => {
    dispatch(registerAction(data));
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100" py={4}>
      <Card sx={{ width: 480, p: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <AccountBalanceIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>Create Account</Typography>
            <Typography color="text.secondary">Join SecureBank today</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="First Name" fullWidth {...register('firstName')}
                  error={!!errors.firstName} helperText={errors.firstName?.message} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Last Name" fullWidth {...register('lastName')}
                  error={!!errors.lastName} helperText={errors.lastName?.message} />
              </Grid>
            </Grid>
            <TextField label="Email" type="email" fullWidth {...register('email')}
              error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Phone (optional)" fullWidth {...register('phone')}
              error={!!errors.phone} helperText={errors.phone?.message} />
            <TextField label="Password" type="password" fullWidth {...register('password')}
              error={!!errors.password} helperText={errors.password?.message} />
            <TextField label="Confirm Password" type="password" fullWidth {...register('confirmPassword')}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
            <Button
              type="submit" variant="contained" fullWidth size="large" disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>

          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>Sign in</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
