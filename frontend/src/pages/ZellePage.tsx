import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  MenuItem, Alert, CircularProgress, Chip, Avatar, Divider,
  List, ListItem, ListItemAvatar, ListItemText, Stack, Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axiosInstance from '../services/axiosInstance';
import { Account, ZelleTransfer, PageResponse } from '../types';
import AppLayout from '../components/layout/AppLayout';

export default function ZellePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [history, setHistory] = useState<ZelleTransfer[]>([]);
  const [contacts, setContacts] = useState<{ emails: string[]; phones: string[] }>({ emails: [], phones: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    fromAccountId: '',
    recipientEmail: '',
    recipientPhone: '',
    recipientName: '',
    amount: '',
    note: '',
  });

  const load = async () => {
    try {
      const [accsRes, histRes, conRes] = await Promise.all([
        axiosInstance.get('/api/accounts'),
        axiosInstance.get('/api/zelle/history'),
        axiosInstance.get('/api/zelle/contacts'),
      ]);
      setAccounts(accsRes.data.data);
      const page: PageResponse<ZelleTransfer> = histRes.data.data;
      setHistory(page.content || []);
      setContacts(conRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    if (!form.fromAccountId || !form.amount) return;
    if (!form.recipientEmail && !form.recipientPhone) {
      setMsg({ type: 'error', text: 'Enter recipient email or phone' });
      return;
    }
    setSending(true);
    try {
      await axiosInstance.post('/api/zelle/send', {
        fromAccountId: Number(form.fromAccountId),
        recipientEmail: form.recipientEmail || undefined,
        recipientPhone: form.recipientPhone || undefined,
        recipientName: form.recipientName || undefined,
        amount: Number(form.amount),
        note: form.note || undefined,
      });
      setSuccess(true);
      setMsg({ type: 'success', text: `$${form.amount} sent via Zelle!` });
      setForm({ fromAccountId: form.fromAccountId, recipientEmail: '', recipientPhone: '', recipientName: '', amount: '', note: '' });
      load();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Transfer failed' });
    } finally { setSending(false); }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <AppLayout>
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} display="flex" alignItems="center" gap={1}>
          <Box component="span" sx={{
            background: 'linear-gradient(135deg, #6200ea, #b388ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800
          }}>Zelle</Box>
          <Typography variant="h4" fontWeight={700} component="span"> — Send Money</Typography>
        </Typography>
        <Typography color="text.secondary">Send money instantly to anyone with an email or phone number</Typography>
      </Box>

      {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

      <Grid container spacing={3}>
        {/* Send Form */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Send Money</Typography>

              {success && (
                <Box textAlign="center" py={3}>
                  <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
                  <Typography variant="h6" color="success.main" fontWeight={700}>Sent!</Typography>
                </Box>
              )}

              <Stack spacing={2}>
                <TextField select fullWidth label="From Account" value={form.fromAccountId}
                  onChange={e => setForm({ ...form, fromAccountId: e.target.value })}>
                  {accounts.map(a => (
                    <MenuItem key={a.accountId} value={a.accountId}>
                      {a.accountType} — {a.accountNumber} (${Number(a.balance).toFixed(2)})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField fullWidth label="Recipient Email" value={form.recipientEmail}
                  onChange={e => setForm({ ...form, recipientEmail: e.target.value, recipientPhone: '' })}
                  placeholder="someone@email.com" />

                <Box display="flex" alignItems="center" gap={1}>
                  <Divider sx={{ flex: 1 }} /><Typography variant="caption" color="text.secondary">OR</Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                <TextField fullWidth label="Recipient Phone" value={form.recipientPhone}
                  onChange={e => setForm({ ...form, recipientPhone: e.target.value, recipientEmail: '' })}
                  placeholder="(555) 123-4567" />

                <TextField fullWidth label="Recipient Name (optional)" value={form.recipientName}
                  onChange={e => setForm({ ...form, recipientName: e.target.value })} />

                <TextField fullWidth label="Amount" type="number" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  inputProps={{ min: 0.01, step: '0.01' }}
                  InputProps={{ startAdornment: <Typography mr={1}>$</Typography> }} />

                <TextField fullWidth label="Note (optional)" value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="What's it for?" />

                <Button fullWidth variant="contained" size="large" startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  onClick={handleSend} disabled={sending || !form.fromAccountId || !form.amount}
                  sx={{
                    background: 'linear-gradient(135deg, #6200ea, #b388ff)',
                    borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: 16,
                    '&:hover': { background: 'linear-gradient(135deg, #4a00b4, #9c4dff)' }
                  }}>
                  {sending ? 'Sending...' : 'Send Now'}
                </Button>
              </Stack>

              {contacts.emails.length > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">Recent contacts</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                    {contacts.emails.map(e => (
                      <Chip key={e} label={e} size="small" clickable
                        onClick={() => setForm({ ...form, recipientEmail: e, recipientPhone: '' })} />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Zelle Info */}
          <Paper sx={{ mt: 2, p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #f3e5f5, #ede7f6)' }}>
            <Typography variant="body2" fontWeight={600} mb={1}>Zelle Features</Typography>
            {['Instant transfers — money moves in minutes', 'No fees for sending or receiving', 'Works with any US bank account', 'Earn 10 reward points per transfer'].map(f => (
              <Box key={f} display="flex" alignItems="center" gap={1} mb={0.5}>
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="body2">{f}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* History */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Transfer History</Typography>
              {history.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" mt={1}>No transfers yet</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {history.map((t, i) => (
                    <React.Fragment key={t.transferId}>
                      {i > 0 && <Divider />}
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: t.direction === 'SENT' ? 'error.light' : 'success.light' }}>
                            <SendIcon sx={{ transform: t.direction === 'RECEIVED' ? 'rotate(180deg)' : 'none', fontSize: 18 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between">
                              <Typography fontWeight={600}>
                                {t.recipientName || t.recipientEmail || t.recipientPhone}
                              </Typography>
                              <Typography fontWeight={700}
                                color={t.direction === 'SENT' ? 'error' : 'success.main'}>
                                {t.direction === 'SENT' ? '-' : '+'}${Number(t.amount).toFixed(2)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="caption">{t.note || (t.recipientEmail || t.recipientPhone)}</Typography>
                              <Box display="flex" gap={0.5} alignItems="center">
                                <Chip label={t.status} size="small"
                                  color={t.status === 'COMPLETED' ? 'success' : 'default'} />
                                <Typography variant="caption">{new Date(t.createdAt).toLocaleDateString()}</Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </AppLayout>
  );
}
