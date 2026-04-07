import React, { useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  Divider, Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProfile, updateProfile, changePassword, clearMessages } from '../features/users/userSlice';
import AppLayout from '../components/layout/AppLayout';

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().optional(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'At least 8 characters').required('New password is required'),
});

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, successMessage } = useAppSelector((state) => state.user);

  const profileForm = useForm({ resolver: yupResolver(profileSchema) });
  const passwordForm = useForm({ resolver: yupResolver(passwordSchema) });

  useEffect(() => {
    dispatch(fetchProfile());
    return () => { dispatch(clearMessages()); };
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      profileForm.reset({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '' });
    }
  }, [profile]); // eslint-disable-line

  const onUpdateProfile = (data: any) => dispatch(updateProfile(data));
  const onChangePassword = (data: any) => {
    dispatch(changePassword(data)).then(() => passwordForm.reset());
  };

  return (
    <AppLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Profile</Typography>
        <Typography color="text.secondary">Manage your personal information</Typography>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Personal Information</Typography>
              {profile && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography>{profile.email}</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">Member since</Typography>
                  <Typography>{new Date(profile.createdAt).toLocaleDateString()}</Typography>
                </Box>
              )}
              <Box component="form" onSubmit={profileForm.handleSubmit(onUpdateProfile)} display="flex" flexDirection="column" gap={2}>
                <TextField label="First Name" fullWidth {...profileForm.register('firstName')}
                  error={!!profileForm.formState.errors.firstName}
                  helperText={profileForm.formState.errors.firstName?.message} />
                <TextField label="Last Name" fullWidth {...profileForm.register('lastName')}
                  error={!!profileForm.formState.errors.lastName}
                  helperText={profileForm.formState.errors.lastName?.message} />
                <TextField label="Phone" fullWidth {...profileForm.register('phone')} />
                <Button type="submit" variant="contained" disabled={loading}>
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
              <Box component="form" onSubmit={passwordForm.handleSubmit(onChangePassword)} display="flex" flexDirection="column" gap={2}>
                <TextField label="Current Password" type="password" fullWidth {...passwordForm.register('currentPassword')}
                  error={!!passwordForm.formState.errors.currentPassword}
                  helperText={passwordForm.formState.errors.currentPassword?.message} />
                <TextField label="New Password" type="password" fullWidth {...passwordForm.register('newPassword')}
                  error={!!passwordForm.formState.errors.newPassword}
                  helperText={passwordForm.formState.errors.newPassword?.message} />
                <Button type="submit" variant="contained" color="warning" disabled={loading}>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default ProfilePage;
