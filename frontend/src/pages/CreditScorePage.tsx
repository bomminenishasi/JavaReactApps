import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import HistoryIcon from '@mui/icons-material/History';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCreditScore } from '../features/creditscore/creditScoreSlice';
import AppLayout from '../components/layout/AppLayout';

// ── Score factor row ──────────────────────────────────────────────────────────
interface FactorRowProps {
  label: string;
  subtitle: string;
  value: number;       // 0-100 for progress bar
  displayValue: string;
  color: string;
}

const FactorRow: React.FC<FactorRowProps> = ({ label, subtitle, value, displayValue, color }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Box>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </Box>
      <Typography variant="body2" fontWeight={700} color={color}>{displayValue}</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 8,
        borderRadius: 4,
        bgcolor: 'grey.200',
        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
      }}
    />
  </Box>
);

// ── Gauge label rendered in centre of chart ───────────────────────────────────
const GaugeCenter: React.FC<{ score: number; category: string; color: string }> = ({
  score,
  category,
  color,
}) => (
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -42%)',
      textAlign: 'center',
      pointerEvents: 'none',
    }}
  >
    <Typography variant="h2" fontWeight={800} color={color} lineHeight={1}>
      {score}
    </Typography>
    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
      {category}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      300 – 850
    </Typography>
  </Box>
);

// ── Ranges legend ──────────────────────────────────────────────────────────────
const RANGES = [
  { label: 'Poor',        range: '300–579', color: '#d32f2f' },
  { label: 'Fair',        range: '580–669', color: '#f57c00' },
  { label: 'Good',        range: '670–739', color: '#fbc02d' },
  { label: 'Very Good',   range: '740–799', color: '#388e3c' },
  { label: 'Exceptional', range: '800–850', color: '#1565c0' },
];

// ── Main page ─────────────────────────────────────────────────────────────────
const CreditScorePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: cs, loading, error } = useAppSelector((s) => s.creditScore);

  useEffect(() => {
    dispatch(fetchCreditScore());
  }, [dispatch]);

  // Payment history: convert pct directly to a bar value
  // Credit utilization: lower is better → invert for bar display
  const paymentBar = cs?.paymentHistoryPct ?? 0;
  const utilBar    = cs ? Math.max(0, 100 - cs.creditUtilizationPct) : 0;
  const ageBar     = cs ? Math.min(100, (cs.accountAgeMonths / 120) * 100) : 0; // cap at 10 yrs
  const mixBar     = cs ? (cs.creditMix / 2) * 100 : 0;

  const gaugeData = cs
    ? [{ value: cs.scorePercent, fill: cs.color }]
    : [{ value: 0, fill: '#e0e0e0' }];

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Credit Score
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your FICO-style score is recalculated each time you view this page based on your
          accounts, transactions, and credit card activity.
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={56} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {cs && !loading && (
          <Grid container spacing={3}>
            {/* ── Gauge card ── */}
            <Grid item xs={12} md={5}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ position: 'relative', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="55%"
                        innerRadius="70%"
                        outerRadius="90%"
                        startAngle={210}
                        endAngle={-30}
                        data={gaugeData}
                        barSize={20}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        {/* Background track */}
                        <RadialBar
                          background={{ fill: '#e0e0e0' }}
                          dataKey="value"
                          cornerRadius={10}
                          angleAxisId={0}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <GaugeCenter score={cs.score} category={cs.category} color={cs.color} />
                  </Box>

                  <Chip
                    label={cs.category}
                    sx={{
                      bgcolor: cs.color,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 1,
                      mt: 1,
                    }}
                  />

                  {/* Score ranges legend */}
                  <Box sx={{ mt: 3, textAlign: 'left' }}>
                    {RANGES.map((r) => (
                      <Box
                        key={r.label}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: r.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {r.label}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {r.range}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <HistoryIcon fontSize="small" color="disabled" />
                    <Typography variant="caption" color="text.secondary">
                      Last updated:{' '}
                      {new Date(cs.lastCalculated).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ── Factors + tip ── */}
            <Grid item xs={12} md={7}>
              <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Score Factors
                  </Typography>

                  <FactorRow
                    label="Payment History"
                    subtitle="35% of score weight — on-time vs failed transactions"
                    value={paymentBar}
                    displayValue={`${cs.paymentHistoryPct}%`}
                    color={cs.paymentHistoryPct >= 95 ? '#388e3c' : cs.paymentHistoryPct >= 80 ? '#fbc02d' : '#d32f2f'}
                  />

                  <FactorRow
                    label="Credit Utilization"
                    subtitle="30% — lower is better (current usage vs credit limit)"
                    value={utilBar}
                    displayValue={`${cs.creditUtilizationPct}%`}
                    color={cs.creditUtilizationPct <= 10 ? '#388e3c' : cs.creditUtilizationPct <= 30 ? '#fbc02d' : '#d32f2f'}
                  />

                  <FactorRow
                    label="Account Age"
                    subtitle="15% — age of oldest account"
                    value={ageBar}
                    displayValue={
                      cs.accountAgeMonths < 12
                        ? `${cs.accountAgeMonths} mo`
                        : `${Math.floor(cs.accountAgeMonths / 12)} yr ${cs.accountAgeMonths % 12} mo`
                    }
                    color={cs.accountAgeMonths >= 60 ? '#388e3c' : cs.accountAgeMonths >= 24 ? '#fbc02d' : '#f57c00'}
                  />

                  <FactorRow
                    label="Credit Mix"
                    subtitle="10% — variety of account types"
                    value={mixBar}
                    displayValue={
                      cs.creditMix === 0
                        ? 'Limited'
                        : cs.creditMix === 1
                        ? 'Moderate'
                        : 'Diverse'
                    }
                    color={cs.creditMix === 2 ? '#388e3c' : cs.creditMix === 1 ? '#fbc02d' : '#f57c00'}
                  />
                </CardContent>
              </Card>

              {/* Tip card */}
              <Card
                elevation={3}
                sx={{
                  background: `linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)`,
                  color: '#fff',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <TipsAndUpdatesIcon sx={{ color: '#ffe082', mt: 0.3, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Personalised Tip
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.92, lineHeight: 1.6 }}>
                        {cs.tip}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </AppLayout>
  );
};

export default CreditScorePage;
