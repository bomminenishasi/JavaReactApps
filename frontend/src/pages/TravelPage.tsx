import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Paper,
  Stack, Divider, CircularProgress, Alert, TextField, MenuItem
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import ExploreIcon from '@mui/icons-material/Explore';
import RedeemIcon from '@mui/icons-material/Redeem';
import axiosInstance from '../services/axiosInstance';
import { RewardsSummary } from '../types';
import AppLayout from '../components/layout/AppLayout';

const deals = [
  { id: 1, type: 'flight', from: 'New York (JFK)', to: 'Miami (MIA)', price: 189, pts: 15120, airline: 'SecureAir', savings: '30%', date: 'May 15 – May 22' },
  { id: 2, type: 'flight', from: 'Los Angeles (LAX)', to: 'Las Vegas (LAS)', price: 79, pts: 6320, airline: 'SecureAir', savings: '25%', date: 'Jun 1 – Jun 5' },
  { id: 3, type: 'hotel', name: 'Grand Hyatt Chicago', location: 'Chicago, IL', price: 199, pts: 15920, stars: 5, savings: '20%', dates: 'Available Jun–Aug' },
  { id: 4, type: 'hotel', name: 'Marriott Bonvoy Cancun', location: 'Cancun, Mexico', price: 159, pts: 12720, stars: 4, savings: '35%', dates: 'Available Jul–Sep' },
  { id: 5, type: 'package', name: 'Hawaii Dream Package', location: 'Honolulu, HI', price: 1299, pts: 103920, stars: 5, savings: '40%', dates: '7 nights, flights + hotel' },
  { id: 6, type: 'package', name: 'Paris Getaway', location: 'Paris, France', price: 2199, pts: 175920, stars: 5, savings: '28%', dates: '8 nights, flights + hotel' },
];

const typeIcon: Record<string, React.ReactNode> = {
  flight: <FlightIcon />, hotel: <HotelIcon />, package: <BeachAccessIcon />
};
const typeColor: Record<string, string> = {
  flight: '#1565c0', hotel: '#2e7d32', package: '#e65100'
};

export default function TravelPage() {
  const [rewards, setRewards] = useState<RewardsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    axiosInstance.get('/api/rewards')
      .then(r => setRewards(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (deal: typeof deals[0]) => {
    if (!rewards || rewards.totalPoints < deal.pts) {
      setMsg({ type: 'error', text: `You need ${deal.pts.toLocaleString()} pts. You have ${rewards?.totalPoints.toLocaleString() || 0} pts.` });
      return;
    }
    setMsg({ type: 'success', text: `Booking confirmed! ${deal.pts.toLocaleString()} points will be redeemed. Check your email for details.` });
  };

  const filtered = filter === 'all' ? deals : deals.filter(d => d.type === filter);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <AppLayout>
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} display="flex" alignItems="center" gap={1}>
          <ExploreIcon sx={{ fontSize: 36, color: '#1565c0' }} /> Travel Rewards
        </Typography>
        <Typography color="text.secondary">Use your points for flights, hotels, and vacation packages</Typography>
      </Box>

      {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

      {/* Points Banner */}
      {rewards && (
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg,#1565c0,#1976d2)', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h5" fontWeight={800}>{rewards.totalPoints.toLocaleString()} Points</Typography>
              <Typography sx={{ opacity: 0.85 }}>= ${rewards.travelValue.toFixed(2)} travel value (1.25¢ per point)</Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Box textAlign="center">
                <Chip icon={<StarIcon />} label={rewards.tier} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
              </Box>
              <Button variant="contained" sx={{ bgcolor: 'white', color: '#1565c0', fontWeight: 700, '&:hover': { bgcolor: '#e3f2fd' } }}
                startIcon={<RedeemIcon />} href="/rewards">
                Manage Points
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Filter */}
      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        {['all', 'flight', 'hotel', 'package'].map(f => (
          <Chip key={f} label={f === 'all' ? 'All Deals' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
            icon={f !== 'all' ? <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: typeColor[f] }}>{typeIcon[f]}</Box> : undefined}
            onClick={() => setFilter(f)} variant={filter === f ? 'filled' : 'outlined'}
            color={filter === f ? 'primary' : 'default'} sx={{ cursor: 'pointer' }} />
        ))}
      </Box>

      <Grid container spacing={3}>
        {filtered.map(deal => (
          <Grid item xs={12} sm={6} md={4} key={deal.id}>
            <Card sx={{ borderRadius: 3, height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-3px)' } }}>
              <Box sx={{ height: 6, bgcolor: typeColor[deal.type] }} />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box sx={{ color: typeColor[deal.type] }}>{typeIcon[deal.type]}</Box>
                  <Chip label={`Save ${deal.savings}`} color="success" size="small" icon={<LocalOfferIcon />} />
                </Box>

                {deal.type === 'flight' ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">{deal.airline}</Typography>
                    <Box display="flex" alignItems="center" gap={1} my={1}>
                      <Typography fontWeight={700} variant="body2">{deal.from?.split(' ')[0]}</Typography>
                      <FlightIcon sx={{ fontSize: 16, color: typeColor[deal.type] }} />
                      <Typography fontWeight={700} variant="body2">{deal.to?.split(' ')[0]}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{deal.date}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box display="flex" gap={0.3} mb={0.5}>
                      {Array.from({ length: deal.stars || 0 }).map((_, i) => (
                        <StarIcon key={i} sx={{ fontSize: 14, color: '#ffa000' }} />
                      ))}
                    </Box>
                    <Typography fontWeight={700}>{deal.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{deal.location}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">{deal.dates}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={800} color={typeColor[deal.type]}>${deal.price}</Typography>
                    <Typography variant="caption" color="text.secondary">or {deal.pts.toLocaleString()} pts</Typography>
                  </Box>
                  <Stack spacing={0.5}>
                    <Button size="small" variant="contained"
                      sx={{ bgcolor: typeColor[deal.type], fontSize: 11 }}
                      onClick={() => setMsg({ type: 'success', text: 'Redirecting to payment...' })}>
                      Book with $
                    </Button>
                    <Button size="small" variant="outlined"
                      sx={{ borderColor: typeColor[deal.type], color: typeColor[deal.type], fontSize: 11 }}
                      disabled={!rewards || rewards.totalPoints < deal.pts}
                      onClick={() => handleBook(deal)}>
                      Use Points
                    </Button>
                  </Stack>
                </Box>
                {rewards && rewards.totalPoints < deal.pts && (
                  <Typography variant="caption" color="error">
                    Need {(deal.pts - rewards.totalPoints).toLocaleString()} more pts
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Travel Tips */}
      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>Maximize Your Travel Rewards</Typography>
          <Grid container spacing={2}>
            {[
              { tip: 'Book 45-60 days ahead', detail: 'Get the best award availability for flights' },
              { tip: 'Use Platinum card for 3x points', detail: 'Earn faster with your credit card on every purchase' },
              { tip: 'Points are worth 25% more on travel', detail: 'Cash out at 1.25¢/pt vs 1¢/pt for cash back' },
              { tip: 'Transfer to airline partners', detail: 'Potentially get 2-3¢/pt value with airline transfers' },
            ].map(t => (
              <Grid item xs={12} sm={6} key={t.tip}>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <ExploreIcon sx={{ color: '#1565c0', mt: 0.3 }} />
                  <Box>
                    <Typography fontWeight={600} variant="body2">{t.tip}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.detail}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
    </AppLayout>
  );
}
