import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  LinearProgress, Divider, Alert, CircularProgress, Stack
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import axiosInstance from '../services/axiosInstance';
import { CreditCard, Account } from '../types';
import AppLayout from '../components/layout/AppLayout';

const cardGradients: Record<string, string> = {
  STANDARD: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
  GOLD: 'linear-gradient(135deg, #e65100 0%, #f57c00 100%)',
  PLATINUM: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
};

const CreditCardVisual: React.FC<{ card: CreditCard }> = ({ card }) => (
  <Box sx={{
    background: cardGradients[card.cardType],
    borderRadius: 3, p: 3, color: 'white', minHeight: 180,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    position: 'relative', overflow: 'hidden',
  }}>
    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
    <Box sx={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Typography variant="h6" fontWeight={700}>SecureBank</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <StarIcon fontSize="small" />
        <Typography variant="body2" fontWeight={600}>{card.cardType}</Typography>
      </Box>
    </Box>
    <Typography variant="h6" letterSpacing={4} mb={2} fontFamily="monospace">
      {card.maskedNumber}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>Available Credit</Typography>
        <Typography variant="h6" fontWeight={700}>${Number(card.availableCredit).toFixed(2)}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>Due Date</Typography>
        <Typography variant="body1" fontWeight={600}>{card.dueDate}</Typography>
      </Box>
    </Box>
  </Box>
);

export default function CreditCardPage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [cardType, setCardType] = useState('STANDARD');
  const [payAmount, setPayAmount] = useState('');
  const [payAccount, setPayAccount] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [cardsRes, accsRes] = await Promise.all([
        axiosInstance.get('/api/credit-cards'),
        axiosInstance.get('/api/accounts'),
      ]);
      setCards(cardsRes.data.data);
      setAccounts(accsRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.post('/api/credit-cards', { cardType });
      setMsg({ type: 'success', text: 'Card approved! Welcome to SecureBank credit.' });
      setApplyOpen(false);
      load();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Application failed' });
    } finally { setSubmitting(false); }
  };

  const handlePay = async () => {
    if (!selectedCard) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(`/api/credit-cards/${selectedCard.cardId}/payment`, {
        fromAccountId: Number(payAccount), amount: Number(payAmount)
      });
      setMsg({ type: 'success', text: 'Payment successful!' });
      setPayOpen(false);
      load();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Payment failed' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <AppLayout>
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Credit Cards</Typography>
          <Typography color="text.secondary">Manage your SecureBank credit cards</Typography>
        </Box>
        <Button variant="contained" startIcon={<CreditCardIcon />} onClick={() => setApplyOpen(true)}
          sx={{ borderRadius: 2, px: 3 }}>
          Apply for Card
        </Button>
      </Box>

      {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

      {cards.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 6, borderRadius: 3, border: '2px dashed', borderColor: 'divider' }}>
          <CreditCardIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No credit cards yet</Typography>
          <Typography color="text.disabled" mb={3}>Apply for a card to start earning rewards</Typography>
          <Button variant="contained" onClick={() => setApplyOpen(true)}>Apply Now</Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cards.map(card => (
            <Grid item xs={12} md={6} key={card.cardId}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box p={2}><CreditCardVisual card={card} /></Box>
                  <Box p={2}>
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={4} textAlign="center">
                        <Typography variant="caption" color="text.secondary">Balance</Typography>
                        <Typography fontWeight={700} color="error">${Number(card.currentBalance).toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="center">
                        <Typography variant="caption" color="text.secondary">Limit</Typography>
                        <Typography fontWeight={700}>${Number(card.creditLimit).toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="center">
                        <Typography variant="caption" color="text.secondary">Min Payment</Typography>
                        <Typography fontWeight={700}>${Number(card.minimumPayment).toFixed(2)}</Typography>
                      </Grid>
                    </Grid>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">Credit Used</Typography>
                        <Typography variant="caption">
                          {card.creditLimit > 0 ? ((card.currentBalance / card.creditLimit) * 100).toFixed(0) : 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={card.currentBalance / card.creditLimit > 0.7 ? 'error' : 'primary'}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip icon={<StarIcon />} label={`${card.rewardPoints.toLocaleString()} pts (${card.rewardMultiplier}x)`}
                        color="warning" size="small" />
                      <Chip label={card.status} color={card.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" startIcon={<PaymentIcon />}
                        onClick={() => { setSelectedCard(card); setPayOpen(true); }}>
                        Make Payment
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Benefits section */}
      <Box mt={4}>
        <Typography variant="h5" fontWeight={700} mb={2}>Card Benefits Comparison</Typography>
        <Grid container spacing={2}>
          {[
            { type: 'STANDARD', limit: '$5,000', rate: '1.5x', color: '#1a237e', perks: ['Purchase Protection', 'Fraud Alerts', 'Online Banking'] },
            { type: 'GOLD', limit: '$15,000', rate: '2x', color: '#e65100', perks: ['All Standard benefits', 'Travel Insurance', 'No Foreign Fees', 'Rental Car Coverage'] },
            { type: 'PLATINUM', limit: '$50,000', rate: '3x', color: '#4a148c', perks: ['All Gold benefits', 'Airport Lounge Access', 'Concierge Service', '$300 Travel Credit', 'Global Entry Credit'] },
          ].map(tier => (
            <Grid item xs={12} md={4} key={tier.type}>
              <Card sx={{ borderRadius: 3, border: `2px solid ${tier.color}20`, height: '100%' }}>
                <CardContent>
                  <Box sx={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`, borderRadius: 2, p: 2, mb: 2, color: 'white', textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>{tier.type}</Typography>
                    <Typography variant="h5" fontWeight={800}>{tier.rate} Points</Typography>
                    <Typography variant="caption">Up to {tier.limit} limit</Typography>
                  </Box>
                  {tier.perks.map(p => (
                    <Box key={p} display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tier.color }} />
                      <Typography variant="body2">{p}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Apply for Credit Card</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Card Type" value={cardType}
            onChange={e => setCardType(e.target.value)} sx={{ mt: 1 }}>
            <MenuItem value="STANDARD">Standard ($5,000 limit · 1.5x rewards)</MenuItem>
            <MenuItem value="GOLD">Gold ($15,000 limit · 2x rewards)</MenuItem>
            <MenuItem value="PLATINUM">Platinum ($50,000 limit · 3x rewards)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApply} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Apply Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Make Card Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {selectedCard && (
              <Alert severity="info">
                Current balance: <strong>${Number(selectedCard.currentBalance).toFixed(2)}</strong> · Min: <strong>${Number(selectedCard.minimumPayment).toFixed(2)}</strong>
              </Alert>
            )}
            <TextField select fullWidth label="Pay From Account" value={payAccount}
              onChange={e => setPayAccount(e.target.value)}>
              {accounts.map(a => (
                <MenuItem key={a.accountId} value={a.accountId}>
                  {a.accountType} — {a.accountNumber} (${Number(a.balance).toFixed(2)})
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Amount" type="number" value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              inputProps={{ min: 0, step: '0.01' }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={submitting || !payAmount || !payAccount}>
            {submitting ? <CircularProgress size={20} /> : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AppLayout>
  );
}
