import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './app/store';

import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import CreditCardPage from './pages/CreditCardPage';
import ZellePage from './pages/ZellePage';
import RewardsPage from './pages/RewardsPage';
import BenefitsPage from './pages/BenefitsPage';
import TravelPage from './pages/TravelPage';
import OpenCheckingAccountPage from './pages/OpenCheckingAccountPage';
import CreditScorePage from './pages/CreditScorePage';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#ff6f00' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

const App: React.FC = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>} />
          <Route path="/credit-cards" element={<ProtectedRoute><CreditCardPage /></ProtectedRoute>} />
          <Route path="/zelle" element={<ProtectedRoute><ZellePage /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          <Route path="/benefits" element={<ProtectedRoute><BenefitsPage /></ProtectedRoute>} />
          <Route path="/travel" element={<ProtectedRoute><TravelPage /></ProtectedRoute>} />
          <Route path="/open-checking" element={<ProtectedRoute><OpenCheckingAccountPage /></ProtectedRoute>} />
          <Route path="/credit-score" element={<ProtectedRoute><CreditScorePage /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);

export default App;
