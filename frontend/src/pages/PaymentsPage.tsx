import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchPayments, schedulePayment, cancelPayment } from '../features/payments/paymentsSlice';
import { fetchAccounts } from '../features/accounts/accountsSlice';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusColor = (status: string) => {
  if (status === 'COMPLETED') return 'success';
  if (status === 'FAILED' || status === 'CANCELLED') return 'error';
  if (status === 'PROCESSING') return 'warning';
  return 'info';
};

const PaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { payments, loading } = useAppSelector((state) => state.payments);
  const { accounts } = useAppSelector((state) => state.accounts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ accountId: '', payeeName: '', amount: '', scheduledDate: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPayments({}));
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleSchedule = async () => {
    setError('');
    if (!form.accountId || !form.payeeName || !form.amount || !form.scheduledDate) {
      setError('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(schedulePayment({
        accountId: Number(form.accountId),
        payeeName: form.payeeName,
        amount: Number(form.amount),
        scheduledDate: form.scheduledDate,
      })).unwrap();
      setDialogOpen(false);
      setForm({ accountId: '', payeeName: '', amount: '', scheduledDate: '' });
    } catch (err: any) {
      setError(err as string);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (paymentId: number) => {
    dispatch(cancelPayment(paymentId));
  };

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Payments</Typography>
          <Typography color="text.secondary">Schedule and manage bill payments</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Schedule Payment
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payee</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Scheduled Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No payments scheduled</TableCell></TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.paymentId}>
                      <TableCell sx={{ fontWeight: 600 }}>{payment.payeeName}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{payment.accountNumber}</TableCell>
                      <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>{payment.scheduledDate}</TableCell>
                      <TableCell>
                        <Chip label={payment.status} size="small" color={statusColor(payment.status) as any} />
                      </TableCell>
                      <TableCell>
                        {payment.status === 'SCHEDULED' && (
                          <Button size="small" color="error" onClick={() => handleCancel(payment.paymentId)}>
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Bill Payment</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField select label="Account" fullWidth value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })} sx={{ mt: 1, mb: 2 }}>
            {accounts.filter((a) => a.status === 'ACTIVE').map((acc) => (
              <MenuItem key={acc.accountId} value={acc.accountId}>
                {acc.accountType} — {acc.accountNumber} (${acc.balance.toFixed(2)})
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Payee Name" fullWidth value={form.payeeName}
            onChange={(e) => setForm({ ...form, payeeName: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Amount ($)" type="number" fullWidth value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} sx={{ mb: 2 }} />
          <TextField label="Scheduled Date" type="date" fullWidth value={form.scheduledDate}
            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
            InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSchedule} disabled={submitting}>
            {submitting ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default PaymentsPage;
