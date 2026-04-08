import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, LinearProgress,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, CircularProgress, Stack, Paper, Divider,
  List, ListItem, ListItemText, Avatar
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import RedeemIcon from '@mui/icons-material/Redeem';
import FlightIcon from '@mui/icons-material/Flight';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axiosInstance from '../services/axiosInstance';
import { RewardsSummary, RewardTransaction, Account, PageResponse, RedeemRequest } from '../types';
import AppLayout from '../components/layout/AppLayout';

const tierColors: Record<string, string> = {
  BASIC: '#9e9e9e', SILVER: '#78909c', GOLD: '#ffa000', PLATINUM: '#7b1fa2'
};
const tierBg: Record<string, string> = {
  BASIC: 'linear-gradient(135deg,#bdbdbd,#9e9e9e)',
  SILVER: 'linear-gradient(135deg,#90a4ae,#607d8b)',
  GOLD: 'linear-gradient(135deg,#ffca28,#ff8f00)',
  PLATINUM: 'linear-gradient(135deg,#ce93d8,#7b1fa2)',
};

export default function RewardsPage() {
  const [summary, setSummary] = useState<RewardsSummary | null>(null);
  const [history, setHistory] = useState<RewardTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemType, setRedeemType] = useState<'CASH' | 'TRAVEL' | 'GIFT_CARD'>('CASH');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemAccount, setRedeemAccount] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [sumRes, histRes, accsRes] = await Promise.all([
        axiosInstance.get('/api/rewards'),
        axiosInstance.get('/api/rewards/history'),
        axiosInstance.get('/api/accounts'),
      ]);
      setSummary(sumRes.data.data);
      const page: PageResponse<RewardTransaction> = histRes.data.data;
      setHistory(page.content || []);
      setAccounts(accsRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRedeem = async () => {
    setSubmitting(true);
    try {
      const req: RedeemRequest = {
        points: Number(redeemPoints),
        redeemType,
        toAccountId: redeemType === 'CASH' && redeemAccount ? Number(redeemAccount) : undefined,
      };
      await axiosInstance.post('/api/rewards/redeem', req);
      setMsg({ type: 'success', text: 'Points redeemed successfully!' });
      setRedeemOpen(false);
      setRedeemPoints('');
      load();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Redemption failed' });
    } finally { setSubmitting(false); }
  };

  const redeemValue = (pts: number) => {
    if (redeemType === 'TRAVEL') return (pts / 80).toFixed(2);
    return (pts / 100).toFixed(2);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <AppLayout>
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Rewards & Points</Typography>
        <Typography color="text.secondary">Track, earn, and redeem your SecureBank rewards</Typography>
      </Box>

      {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

      <Grid container spacing={3}>
        {/* Points Summary Card */}
        {summary && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 4 }}>
              <Box sx={{ background: tierBg[summary.tier], p: 3, color: 'white', textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 48 }} />
                <Typography variant="h3" fontWeight={800}>{summary.totalPoints.toLocaleString()}</Typography>
                <Typography variant="h6">Points Available</Typography>
                <Chip label={summary.tier} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 700 }} />
              </Box>
              <CardContent>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">Progress to {summary.tier === 'PLATINUM' ? 'MAX' : 'next tier'}</Typography>
                    <Typography variant="body2" fontWeight={600}>{summary.progressPercent.toFixed(0)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={summary.progressPercent}
                    sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: tierColors[summary.tier] } }} />
                  {summary.tier !== 'PLATINUM' && (
                    <Typography variant="caption" color="text.secondary">
                      {summary.pointsToNextTier.toLocaleString()} pts to next tier
                    </Typography>
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">Lifetime</Typography>
                    <Typography fontWeight={700}>{summary.lifetimePoints.toLocaleString()}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">Cash Value</Typography>
                    <Typography fontWeight={700} color="success.main">${summary.cashValue.toFixed(2)}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">Travel Value</Typography>
                    <Typography fontWeight={700} color="primary">${summary.travelValue.toFixed(2)}</Typography>
                  </Box>
                </Box>
                <Button fullWidth variant="contained" startIcon={<RedeemIcon />} sx={{ mt: 2, borderRadius: 2 }}
                  onClick={() => setRedeemOpen(true)} disabled={!summary.totalPoints}>
                  Redeem Points
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Redeem Options */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {[
              { type: 'CASH', icon: <AttachMoneyIcon sx={{ fontSize: 36 }} />, title: 'Cash Back', desc: '100 pts = $1.00', color: '#2e7d32', rate: '100 pts / $1' },
              { type: 'TRAVEL', icon: <FlightIcon sx={{ fontSize: 36 }} />, title: 'Travel Credits', desc: '80 pts = $1.00', color: '#1565c0', rate: '80 pts / $1', badge: 'BEST VALUE' },
              { type: 'GIFT_CARD', icon: <CardGiftcardIcon sx={{ fontSize: 36 }} />, title: 'Gift Cards', desc: '100 pts = $1.00', color: '#6a1b9a', rate: '100 pts / $1' },
            ].map(opt => (
              <Grid item xs={12} sm={4} key={opt.type}>
                <Card sx={{ borderRadius: 3, cursor: 'pointer', border: `2px solid ${opt.color}20`, transition: 'all 0.2s',
                  '&:hover': { borderColor: opt.color, boxShadow: 3, transform: 'translateY(-2px)' } }}
                  onClick={() => { setRedeemType(opt.type as any); setRedeemOpen(true); }}>
                  <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                    {opt.badge && <Chip label={opt.badge} color="warning" size="small" sx={{ mb: 1 }} />}
                    <Box sx={{ color: opt.color, mb: 1 }}>{opt.icon}</Box>
                    <Typography fontWeight={700}>{opt.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{opt.desc}</Typography>
                    {summary && <Typography variant="caption" color={opt.color} fontWeight={600}>
                      = ${redeemValue(summary.totalPoints)} available
                    </Typography>}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Tier Benefits */}
          <Card sx={{ mt: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Tier Benefits</Typography>
              <Grid container spacing={1}>
                {[
                  { tier: 'BASIC', pts: '0', perks: ['1.5x on credit card', 'Birthday bonus pts', 'Online access'] },
                  { tier: 'SILVER', pts: '5,000', perks: ['2x on dining & gas', 'Free wire transfers', 'Priority support'] },
                  { tier: 'GOLD', pts: '15,000', perks: ['2.5x everywhere', 'Travel insurance', 'No ATM fees'] },
                  { tier: 'PLATINUM', pts: '50,000', perks: ['3x everywhere', 'Airport lounge', '$300 travel credit'] },
                ].map(t => (
                  <Grid item xs={6} sm={3} key={t.tier}>
                    <Paper sx={{ p: 1.5, borderRadius: 2, border: summary?.tier === t.tier ? `2px solid ${tierColors[t.tier]}` : '2px solid transparent',
                      bgcolor: summary?.tier === t.tier ? `${tierColors[t.tier]}10` : 'grey.50' }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: tierColors[t.tier] }}>{t.tier}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{t.pts}+ pts</Typography>
                      {t.perks.map(p => <Typography key={p} variant="caption" display="block" color="text.secondary">• {p}</Typography>)}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon /> Points History
              </Typography>
              {history.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">No reward activity yet. Start earning!</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {history.map((t, i) => (
                    <React.Fragment key={t.rewardTxnId}>
                      {i > 0 && <Divider />}
                      <ListItem sx={{ px: 0 }}>
                        <Avatar sx={{ mr: 2, bgcolor: t.txnType === 'EARNED' || t.txnType === 'BONUS' ? 'success.light' : 'error.light', width: 36, height: 36 }}>
                          {t.txnType === 'EARNED' ? <TrendingUpIcon fontSize="small" /> : <RedeemIcon fontSize="small" />}
                        </Avatar>
                        <ListItemText
                          primary={t.description}
                          secondary={new Date(t.createdAt).toLocaleString()}
                        />
                        <Typography fontWeight={700}
                          color={t.points > 0 ? 'success.main' : 'error'}>
                          {t.points > 0 ? '+' : ''}{t.points.toLocaleString()} pts
                        </Typography>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Redeem Dialog */}
      <Dialog open={redeemOpen} onClose={() => setRedeemOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Redeem Points</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {summary && <Alert severity="info">You have <strong>{summary.totalPoints.toLocaleString()}</strong> points available</Alert>}
            <TextField select fullWidth label="Redeem For" value={redeemType}
              onChange={e => setRedeemType(e.target.value as any)}>
              <MenuItem value="CASH">Cash Back (100 pts = $1)</MenuItem>
              <MenuItem value="TRAVEL">Travel Credits (80 pts = $1 — Best Value!)</MenuItem>
              <MenuItem value="GIFT_CARD">Gift Card (100 pts = $1)</MenuItem>
            </TextField>
            <TextField fullWidth label="Points to Redeem" type="number" value={redeemPoints}
              onChange={e => setRedeemPoints(e.target.value)}
              inputProps={{ min: 100, step: 100 }}
              helperText={redeemPoints ? `= $${redeemValue(Number(redeemPoints))} value` : ''} />
            {redeemType === 'CASH' && (
              <TextField select fullWidth label="Deposit To Account" value={redeemAccount}
                onChange={e => setRedeemAccount(e.target.value)}>
                {accounts.map(a => (
                  <MenuItem key={a.accountId} value={a.accountId}>
                    {a.accountType} — {a.accountNumber}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRedeemOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRedeem}
            disabled={submitting || !redeemPoints || Number(redeemPoints) < 100}>
            {submitting ? <CircularProgress size={20} /> : 'Redeem'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AppLayout>
  );
}
