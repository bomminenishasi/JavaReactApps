import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, MenuItem, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Pagination, Grid,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAccounts } from '../features/accounts/accountsSlice';
import {
  fetchTransactions, transferFunds, depositFunds, withdrawFunds,
} from '../features/transactions/transactionsSlice';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

type ActionType = 'transfer' | 'deposit' | 'withdraw' | null;

const statusColor = (status: string) => {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'error';
  return 'warning';
};

const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector((state) => state.accounts);
  const { transactions, totalPages, loading } = useAppSelector((state) => state.transactions);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [toAccountId, setToAccountId] = useState<number | ''>('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchAccounts()); }, [dispatch]);

  useEffect(() => {
    if (selectedAccountId) {
      dispatch(fetchTransactions({ accountId: selectedAccountId as number, page: page - 1 }));
    }
  }, [dispatch, selectedAccountId, page]);

  const handleSubmitAction = async () => {
    if (!amount || isNaN(Number(amount))) { setActionError('Enter a valid amount'); return; }
    setSubmitting(true);
    setActionError('');
    try {
      if (action === 'transfer' && toAccountId) {
        await dispatch(transferFunds({
          fromAccountId: selectedAccountId as number,
          toAccountId: toAccountId as number,
          amount: Number(amount), description,
        })).unwrap();
      } else if (action === 'deposit') {
        await dispatch(depositFunds({ accountId: selectedAccountId as number, amount: Number(amount), description })).unwrap();
      } else if (action === 'withdraw') {
        await dispatch(withdrawFunds({ accountId: selectedAccountId as number, amount: Number(amount), description })).unwrap();
      }
      setAction(null); setAmount(''); setDescription(''); setToAccountId('');
      dispatch(fetchTransactions({ accountId: selectedAccountId as number, page: 0 }));
      dispatch(fetchAccounts());
    } catch (err: any) {
      setActionError(err as string);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Transactions</Typography>
        <Typography color="text.secondary">View history and perform transactions</Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField select label="Select Account" fullWidth value={selectedAccountId}
            onChange={(e) => { setSelectedAccountId(Number(e.target.value)); setPage(1); }}>
            {accounts.map((acc) => (
              <MenuItem key={acc.accountId} value={acc.accountId}>
                {acc.accountType} — {acc.accountNumber} (${acc.balance.toFixed(2)})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button variant="outlined" disabled={!selectedAccountId} onClick={() => setAction('deposit')}>Deposit</Button>
            <Button variant="outlined" disabled={!selectedAccountId} onClick={() => setAction('withdraw')}>Withdraw</Button>
            <Button variant="outlined" disabled={!selectedAccountId} onClick={() => setAction('transfer')}>Transfer</Button>
          </Box>
        </Grid>
      </Grid>

      {loading ? (
        <LoadingSpinner />
      ) : !selectedAccountId ? (
        <Card><CardContent><Typography color="text.secondary">Select an account to view transactions.</Typography></CardContent></Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>From/To</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No transactions found</TableCell></TableRow>
                ) : (
                  transactions.map((txn) => (
                    <TableRow key={txn.txnId}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{txn.referenceNo.slice(0, 8)}...</TableCell>
                      <TableCell><Chip label={txn.txnType} size="small" /></TableCell>
                      <TableCell fontWeight={600}>${Number(txn.amount).toFixed(2)}</TableCell>
                      <TableCell><Chip label={txn.status} size="small" color={statusColor(txn.status) as any} /></TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {txn.fromAccountNumber ? `From: ${txn.fromAccountNumber}` : ''}
                        {txn.toAccountNumber ? ` To: ${txn.toAccountNumber}` : ''}
                      </TableCell>
                      <TableCell>{new Date(txn.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!action} onClose={() => setAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{action === 'transfer' ? 'Transfer Funds' : action === 'deposit' ? 'Deposit' : 'Withdraw'}</DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {action === 'transfer' && (
            <TextField select label="To Account" fullWidth value={toAccountId}
              onChange={(e) => setToAccountId(Number(e.target.value))} sx={{ mt: 1, mb: 2 }}>
              {accounts.filter((a) => a.accountId !== selectedAccountId).map((acc) => (
                <MenuItem key={acc.accountId} value={acc.accountId}>
                  {acc.accountType} — {acc.accountNumber}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField label="Amount ($)" type="number" fullWidth value={amount}
            onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Description (optional)" fullWidth value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAction(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitAction} disabled={submitting}>
            {submitting ? 'Processing...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default TransactionsPage;
