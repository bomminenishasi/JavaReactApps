import React, { useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAccounts } from '../features/accounts/accountsSlice';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { accounts, loading } = useAppSelector((state) => state.accounts);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => { dispatch(fetchAccounts()); }, [dispatch]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const chartData = accounts.map((acc) => ({
    name: `${acc.accountType} ...${acc.accountNumber.slice(-4)}`,
    balance: acc.balance,
  }));

  return (
    <AppLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography color="text.secondary">Here's your financial overview</Typography>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Grid container spacing={3}>
          {/* Total Balance Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccountBalanceWalletIcon />
                  <Typography variant="body2">Total Balance</Typography>
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Accounts Summary */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>Your Accounts</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => navigate('/accounts')}>
                    New Account
                  </Button>
                </Box>
                {accounts.length === 0 ? (
                  <Typography color="text.secondary">No accounts yet. Create one to get started.</Typography>
                ) : (
                  accounts.map((acc) => (
                    <Box key={acc.accountId}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
                        <Box>
                          <Typography fontWeight={600}>{acc.accountType} Account</Typography>
                          <Typography variant="body2" color="text.secondary">{acc.accountNumber}</Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography fontWeight={600}>
                            ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Typography>
                          <Chip
                            label={acc.status}
                            size="small"
                            color={acc.status === 'ACTIVE' ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                      <Divider />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Balance Chart */}
          {accounts.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Balance Overview</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']} />
                      <Bar dataKey="balance" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Quick Actions</Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button variant="outlined" onClick={() => navigate('/transactions')}>Transfer Funds</Button>
                  <Button variant="outlined" onClick={() => navigate('/transactions')}>Deposit</Button>
                  <Button variant="outlined" onClick={() => navigate('/payments')}>Pay Bills</Button>
                  <Button variant="outlined" onClick={() => navigate('/accounts')}>View Accounts</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
