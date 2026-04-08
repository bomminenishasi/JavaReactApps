import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Box, Divider, Chip,
} from '@mui/material';
import DashboardIcon          from '@mui/icons-material/Dashboard';
import AccountBalanceIcon     from '@mui/icons-material/AccountBalance';
import SwapHorizIcon          from '@mui/icons-material/SwapHoriz';
import PaymentIcon            from '@mui/icons-material/Payment';
import PersonIcon             from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CreditCardIcon         from '@mui/icons-material/CreditCard';
import SendIcon               from '@mui/icons-material/Send';
import StarIcon               from '@mui/icons-material/Star';
import FlightIcon             from '@mui/icons-material/Flight';
import EmojiEventsIcon        from '@mui/icons-material/EmojiEvents';
import AddCircleOutlineIcon   from '@mui/icons-material/AddCircleOutline';
import ScoreIcon              from '@mui/icons-material/Score';
import { useAppSelector }     from '../../app/hooks';

const DRAWER_WIDTH = 252;

const navSections = (hasChecking: boolean) => [
  {
    label: 'Banking',
    items: [
      { label: 'Dashboard',          path: '/dashboard',      icon: <DashboardIcon /> },
      { label: 'Accounts',           path: '/accounts',       icon: <AccountBalanceIcon /> },
      // Hidden once user has a checking account
      ...(!hasChecking ? [{
        label: 'Open Checking Acct',
        path: '/open-checking',
        icon: <AddCircleOutlineIcon />,
        badge: 'NEW',
      }] : []),
      { label: 'Transactions',       path: '/transactions',   icon: <SwapHorizIcon /> },
      { label: 'Payments',           path: '/payments',       icon: <PaymentIcon /> },
    ],
  },
  {
    label: 'Cards & Payments',
    items: [
      { label: 'Credit Cards',  path: '/credit-cards', icon: <CreditCardIcon />, badge: 'NEW' },
      { label: 'Zelle',         path: '/zelle',        icon: <SendIcon />,       badge: 'NEW' },
    ],
  },
  {
    label: 'Score & Rewards',
    items: [
      { label: 'Credit Score', path: '/credit-score', icon: <ScoreIcon />,        badge: 'NEW' },
      { label: 'Rewards',      path: '/rewards',      icon: <StarIcon /> },
      { label: 'Travel',       path: '/travel',       icon: <FlightIcon /> },
      { label: 'Benefits',     path: '/benefits',     icon: <EmojiEventsIcon /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
    ],
  },
];

const Sidebar: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAppSelector((state: any) => state.auth);
  const accounts  = useAppSelector((state: any) => state.accounts.accounts ?? []);

  const hasChecking = accounts.some(
    (a: any) => a.accountType === 'CHECKING' && a.status === 'ACTIVE'
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: '#0d1b2a' },
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalanceIcon sx={{ color: '#64b5f6' }} />
          <Typography variant="h6" color="white" fontWeight={700}>SecureBank</Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {navSections(hasChecking).map((section, si, arr) => (
        <Box key={section.label}>
          <Typography variant="caption" sx={{
            color: 'rgba(255,255,255,0.4)', pl: 2, pt: 1.5, pb: 0.5,
            display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10,
          }}>
            {section.label}
          </Typography>
          <List disablePadding>
            {section.items.map(({ label, path, icon, badge }: any) => (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith(path)}
                  onClick={() => navigate(path)}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mx: 1, borderRadius: 2, mb: 0.3,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(100,181,246,0.2)',
                      color: '#64b5f6',
                      '& .MuiListItemIcon-root': { color: '#64b5f6' },
                      '&:hover': { bgcolor: 'rgba(100,181,246,0.25)' },
                    },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 36 }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
                  {badge && (
                    <Chip label={badge} size="small" sx={{
                      height: 16, fontSize: 9, bgcolor: '#64b5f6', color: '#0d1b2a',
                      fontWeight: 700, '& .MuiChip-label': { px: 0.5 },
                    }} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {si < arr.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, my: 0.5 }} />}
        </Box>
      ))}

      {user?.role === 'ADMIN' && (
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/admin'}
              onClick={() => navigate('/admin')}
              sx={{
                color: 'rgba(255,255,255,0.8)', mx: 1, borderRadius: 2,
                '&.Mui-selected': { bgcolor: 'rgba(100,181,246,0.2)', color: '#64b5f6' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 36 }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Drawer>
  );
};

export default Sidebar;
