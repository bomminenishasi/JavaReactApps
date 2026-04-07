import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAccounts, createAccount } from '../features/accounts/accountsSlice';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AccountsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts, loading } = useAppSelector((state) => state.accounts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING'>('SAVINGS');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { dispatch(fetchAccounts()); }, [dispatch]);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      await dispatch(createAccount({ accountType })).unwrap();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err as string);
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Accounts</Typography>
          <Typography color="text.secondary">Manage your bank accounts</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Account
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" mb={2}>No accounts yet</Typography>
            <Button variant="contained" onClick={() => setDialogOpen(true)}>Open your first account</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} md={6} lg={4} key={account.accountId}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{account.accountType}</Typography>
                      <Typography variant="body2" color="text.secondary">{account.accountNumber}</Typography>
                    </Box>
                    <Chip label={account.status} size="small" color={account.status === 'ACTIVE' ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>{account.currency}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Opened {new Date(account.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Open New Account</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            select label="Account Type" fullWidth value={accountType}
            onChange={(e) => setAccountType(e.target.value as 'SAVINGS' | 'CHECKING')} sx={{ mt: 1 }}
          >
            <MenuItem value="SAVINGS">Savings Account</MenuItem>
            <MenuItem value="CHECKING">Checking Account</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default AccountsPage;
