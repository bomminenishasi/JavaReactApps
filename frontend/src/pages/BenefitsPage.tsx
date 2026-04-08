import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Paper, Divider, Stack
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LuggageIcon from '@mui/icons-material/Luggage';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StarIcon from '@mui/icons-material/Star';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AppLayout from '../components/layout/AppLayout';

const benefits = [
  {
    category: 'Travel',
    color: '#1565c0',
    icon: <FlightIcon />,
    items: [
      { title: 'Airport Lounge Access', desc: 'Complimentary Priority Pass membership — 1,300+ lounges worldwide', tier: 'PLATINUM' },
      { title: '$300 Annual Travel Credit', desc: 'Automatically applied to travel purchases each year', tier: 'PLATINUM' },
      { title: 'Global Entry / TSA PreCheck', desc: '$100 credit every 4 years for application fee', tier: 'GOLD' },
      { title: 'No Foreign Transaction Fees', desc: 'Use your card abroad without extra charges', tier: 'GOLD' },
      { title: 'Trip Cancellation Insurance', desc: 'Up to $10,000 per trip for covered reasons', tier: 'GOLD' },
      { title: 'Lost Luggage Reimbursement', desc: 'Up to $3,000 for lost or damaged bags', tier: 'STANDARD' },
    ],
  },
  {
    category: 'Protection',
    color: '#2e7d32',
    icon: <ShieldIcon />,
    items: [
      { title: 'Purchase Protection', desc: 'Covers new purchases against damage or theft for 120 days', tier: 'STANDARD' },
      { title: 'Extended Warranty', desc: 'Extends manufacturer warranty by up to 1 additional year', tier: 'STANDARD' },
      { title: 'Zero Liability Fraud Protection', desc: 'Never responsible for unauthorized charges', tier: 'STANDARD' },
      { title: 'Price Protection', desc: 'Refunds the difference if price drops within 90 days', tier: 'GOLD' },
      { title: 'Return Protection', desc: 'Refunds items up to $500 if store won\'t accept return', tier: 'GOLD' },
    ],
  },
  {
    category: 'Insurance',
    color: '#6a1b9a',
    icon: <LocalHospitalIcon />,
    items: [
      { title: 'Travel Medical Insurance', desc: 'Emergency medical coverage up to $100,000 while traveling', tier: 'GOLD' },
      { title: 'Rental Car Insurance', desc: 'Primary collision damage waiver on rentals', tier: 'STANDARD' },
      { title: 'Trip Delay Reimbursement', desc: 'Up to $500 per ticket for delays over 6 hours', tier: 'GOLD' },
      { title: 'Cell Phone Protection', desc: 'Up to $800 per claim against theft or damage', tier: 'PLATINUM' },
    ],
  },
  {
    category: 'Banking Perks',
    color: '#e65100',
    icon: <AccountBalanceIcon />,
    items: [
      { title: 'Free ATM Withdrawals', desc: 'No fees at 50,000+ ATMs nationwide', tier: 'SILVER' },
      { title: 'Free Wire Transfers', desc: 'Unlimited domestic and international wires', tier: 'GOLD' },
      { title: 'High-Yield Savings Boost', desc: 'Extra 0.5% APY on savings when you have Platinum card', tier: 'PLATINUM' },
      { title: 'Overdraft Protection', desc: 'Automatic transfer from savings to prevent overdraft', tier: 'STANDARD' },
    ],
  },
  {
    category: 'Concierge & Lifestyle',
    color: '#7b1fa2',
    icon: <SupportAgentIcon />,
    items: [
      { title: '24/7 Concierge Service', desc: 'Personal assistance for travel, dining, entertainment', tier: 'PLATINUM' },
      { title: 'Hotel Elite Status', desc: 'Automatic Gold status at Marriott, Hilton, Hyatt', tier: 'PLATINUM' },
      { title: 'DoorDash DashPass', desc: 'Free DashPass membership ($120 value) annually', tier: 'GOLD' },
      { title: 'Lyft Credits', desc: '$10/month in Lyft credits when you pay with your card', tier: 'GOLD' },
      { title: 'Priority Customer Support', desc: 'Skip the queue — dedicated phone line for Platinum', tier: 'GOLD' },
    ],
  },
];

const tierColor: Record<string, string> = {
  STANDARD: '#757575', SILVER: '#607d8b', GOLD: '#f57c00', PLATINUM: '#7b1fa2'
};

export default function BenefitsPage() {
  return (
    <AppLayout>
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Card Benefits</Typography>
        <Typography color="text.secondary">Everything included with your SecureBank cards</Typography>
      </Box>

      {/* Tier Legend */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" fontWeight={600}>Benefits available from:</Typography>
        {Object.entries(tierColor).map(([t, c]) => (
          <Chip key={t} icon={<StarIcon sx={{ color: `${c} !important`, fontSize: 16 }} />}
            label={t} size="small" sx={{ borderColor: c, color: c, fontWeight: 600 }} variant="outlined" />
        ))}
      </Paper>

      <Stack spacing={3}>
        {benefits.map(section => (
          <Box key={section.category}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ color: section.color }}>{section.icon}</Box>
              <Typography variant="h6" fontWeight={700}>{section.category}</Typography>
            </Box>
            <Grid container spacing={2}>
              {section.items.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                  <Card sx={{
                    borderRadius: 3, height: '100%',
                    borderLeft: `4px solid ${tierColor[item.tier]}`,
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                  }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography fontWeight={700} variant="body1" sx={{ flex: 1 }}>{item.title}</Typography>
                        <Chip label={item.tier} size="small"
                          sx={{ bgcolor: `${tierColor[item.tier]}15`, color: tierColor[item.tier], fontWeight: 600, ml: 1 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ mt: 3 }} />
          </Box>
        ))}
      </Stack>

      {/* Upgrade CTA */}
      <Card sx={{ mt: 3, borderRadius: 3, background: 'linear-gradient(135deg,#4a148c,#7b1fa2)', color: 'white', p: 1 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <WorkspacePremiumIcon sx={{ fontSize: 48 }} />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700}>Unlock All Benefits with Platinum</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Apply for the Platinum card and enjoy every benefit above — from airport lounges to $300 travel credits.
              </Typography>
            </Box>
            <Chip label="Apply Now" sx={{ bgcolor: 'white', color: '#7b1fa2', fontWeight: 700, px: 2, py: 2.5, fontSize: 14, cursor: 'pointer' }}
              onClick={() => window.location.href = '/credit-cards'} />
          </Box>
        </CardContent>
      </Card>
    </Box>
    </AppLayout>
  );
}
