import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Stepper, Step, StepLabel,
  TextField, MenuItem, Alert, Grid, Divider, Checkbox, FormControlLabel,
  InputAdornment, Chip, CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import DescriptionOffIcon from '@mui/icons-material/DoNotDisturb';
import AppLayout from '../components/layout/AppLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createAccount, fetchAccounts } from '../features/accounts/accountsSlice';

const STEPS = [
  'Personal Info',
  'Contact Info',
  'Financial Info',
  'Account Features',
  'Review & Confirm',
];

const COUNTRIES = [
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany',
  'France', 'India', 'China', 'Japan', 'Australia', 'Brazil', 'Other',
];

const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED', label: 'Employed (Full-time / Part-time)' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed / Business Owner' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'OTHER', label: 'Other' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

interface FormData {
  // Step 1 – Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  countryOfCitizenship: string;
  // Step 2 – Contact
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  // Step 3 – Financial
  annualIncome: string;
  employmentStatus: string;
  // Step 5 – Terms
  agreedToTerms: boolean;
}

const empty: FormData = {
  firstName: '', lastName: '', dateOfBirth: '', ssn: '', countryOfCitizenship: '',
  phoneNumber: '', streetAddress: '', city: '', state: '', zipCode: '',
  annualIncome: '', employmentStatus: '',
  agreedToTerms: false,
};

// ── SSN auto-format helper ────────────────────────────────────────────────────
function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// ── Phone auto-format helper ──────────────────────────────────────────────────
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const FeatureRow: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <Box display="flex" alignItems="flex-start" gap={2} py={1.5}>
    <Box sx={{ color: 'success.main', mt: 0.3 }}>{icon}</Box>
    <Box>
      <Typography fontWeight={600}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{desc}</Typography>
    </Box>
  </Box>
);

const OpenCheckingAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user }   = useAppSelector((s: any) => s.auth);
  const accounts    = useAppSelector((s: any) => s.accounts.accounts ?? []);
  const hasChecking = accounts.some((a: any) => a.accountType === 'CHECKING' && a.status === 'ACTIVE');

  // Load accounts on mount so we can check for existing checking account
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Redirect away if user already has a checking account
  useEffect(() => {
    if (hasChecking) {
      navigate('/accounts', { replace: true, state: { info: 'You already have a Checking Account.' } });
    }
  }, [hasChecking, navigate]);

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    ...empty,
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── Validation per step ──────────────────────────────────────────────────────
  const validate = (step: number): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (step === 0) {
      if (!form.firstName.trim()) errs.firstName = 'Required';
      if (!form.lastName.trim()) errs.lastName = 'Required';
      if (!form.dateOfBirth) errs.dateOfBirth = 'Required';
      else {
        const dob = new Date(form.dateOfBirth);
        const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 18) errs.dateOfBirth = 'Must be at least 18 years old';
      }
      if (!/^\d{3}-\d{2}-\d{4}$/.test(form.ssn)) errs.ssn = 'Must be in format ###-##-####';
      if (!form.countryOfCitizenship) errs.countryOfCitizenship = 'Required';
    }

    if (step === 1) {
      if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, '').length < 10)
        errs.phoneNumber = 'Valid 10-digit phone required';
      if (!form.streetAddress.trim()) errs.streetAddress = 'Required';
      if (!form.city.trim()) errs.city = 'Required';
      if (!form.state) errs.state = 'Required';
      if (!/^\d{5}(-\d{4})?$/.test(form.zipCode)) errs.zipCode = 'Invalid ZIP (e.g. 12345)';
    }

    if (step === 2) {
      const income = parseFloat(form.annualIncome);
      if (!form.annualIncome || isNaN(income) || income <= 0) errs.annualIncome = 'Enter a valid income';
      if (!form.employmentStatus) errs.employmentStatus = 'Required';
    }

    if (step === 4) {
      if (!form.agreedToTerms) errs.agreedToTerms = 'You must agree to the account terms';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate(activeStep)) setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await dispatch(createAccount({
        accountType: 'CHECKING',
        currency: 'USD',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        ssn: form.ssn,
        countryOfCitizenship: form.countryOfCitizenship,
        phoneNumber: form.phoneNumber,
        streetAddress: form.streetAddress.trim(),
        city: form.city.trim(),
        state: form.state,
        zipCode: form.zipCode,
        annualIncome: parseFloat(form.annualIncome),
        employmentStatus: form.employmentStatus,
        agreedToTerms: true,
      } as any)).unwrap();
      setSuccess(true);
    } catch (err: any) {
      setSubmitError(typeof err === 'string' ? err : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Card sx={{ maxWidth: 520, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} mb={1}>Account Opened!</Typography>
              <Typography color="text.secondary" mb={1}>
                Congratulations, <strong>{form.firstName}</strong>! Your new Checking Account has been successfully created.
              </Typography>
              <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary">Your account features:</Typography>
                <Typography variant="body2">✅ No monthly service fee</Typography>
                <Typography variant="body2">✅ No paper checks</Typography>
                <Typography variant="body2">✅ No overdrafts</Typography>
              </Box>
              <Button variant="contained" size="large" onClick={() => navigate('/accounts')}>
                View My Accounts
              </Button>
            </CardContent>
          </Card>
        </Box>
      </AppLayout>
    );
  }

  // ── Step content ──────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (activeStep) {
      // ── Step 0: Personal Information ─────────────────────────────────────────
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name" fullWidth value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                error={!!errors.firstName} helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name" fullWidth value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                error={!!errors.lastName} helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth" type="date" fullWidth value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth} helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Social Security Number (SSN)" fullWidth value={form.ssn}
                onChange={(e) => set('ssn', formatSSN(e.target.value))}
                error={!!errors.ssn} helperText={errors.ssn || '###-##-####'}
                placeholder="123-45-6789"
                inputProps={{ maxLength: 11 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select label="Country of Citizenship" fullWidth value={form.countryOfCitizenship}
                onChange={(e) => set('countryOfCitizenship', e.target.value)}
                error={!!errors.countryOfCitizenship} helperText={errors.countryOfCitizenship}
              >
                {COUNTRIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );

      // ── Step 1: Contact Information ──────────────────────────────────────────
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Phone Number" fullWidth value={form.phoneNumber}
                onChange={(e) => set('phoneNumber', formatPhone(e.target.value))}
                error={!!errors.phoneNumber} helperText={errors.phoneNumber}
                placeholder="(555) 123-4567"
                inputProps={{ maxLength: 14 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Address" fullWidth value={form.streetAddress}
                onChange={(e) => set('streetAddress', e.target.value)}
                error={!!errors.streetAddress} helperText={errors.streetAddress}
                placeholder="123 Main St, Apt 4B"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="City" fullWidth value={form.city}
                onChange={(e) => set('city', e.target.value)}
                error={!!errors.city} helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select label="State" fullWidth value={form.state}
                onChange={(e) => set('state', e.target.value)}
                error={!!errors.state} helperText={errors.state}
              >
                {US_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="ZIP Code" fullWidth value={form.zipCode}
                onChange={(e) => set('zipCode', e.target.value.replace(/[^\d-]/g, '').slice(0, 10))}
                error={!!errors.zipCode} helperText={errors.zipCode}
                placeholder="12345"
              />
            </Grid>
          </Grid>
        );

      // ── Step 2: Financial Information ────────────────────────────────────────
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Annual Income" fullWidth value={form.annualIncome}
                onChange={(e) => set('annualIncome', e.target.value.replace(/[^\d.]/g, ''))}
                error={!!errors.annualIncome} helperText={errors.annualIncome}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select label="Employment Status" fullWidth value={form.employmentStatus}
                onChange={(e) => set('employmentStatus', e.target.value)}
                error={!!errors.employmentStatus} helperText={errors.employmentStatus}
              >
                {EMPLOYMENT_STATUSES.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                Your income information is used to verify your identity and eligibility. It will not affect your account approval.
              </Alert>
            </Grid>
          </Grid>
        );

      // ── Step 3: Account Features ──────────────────────────────────────────────
      case 3:
        return (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={0.5}>
              Your SecureBank Checking Account includes:
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              A straightforward, transparent checking account — no surprises.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FeatureRow
              icon={<MoneyOffIcon />}
              title="No Monthly Service Fee"
              desc="Keep your money. We never charge a monthly maintenance fee, period."
            />
            <Divider />
            <FeatureRow
              icon={<DescriptionOffIcon />}
              title="No Paper Checks"
              desc="Go paperless. Use digital payments, Zelle, and bill pay instead."
            />
            <Divider />
            <FeatureRow
              icon={<BlockIcon />}
              title="No Overdrafts"
              desc="Transactions are declined when funds are insufficient — no overdraft fees ever."
            />
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label="FDIC Insured" color="primary" size="small" />
              <Chip label="Free Online Banking" color="primary" size="small" />
              <Chip label="Free Debit Card" color="primary" size="small" />
              <Chip label="24/7 Support" color="primary" size="small" />
            </Box>
          </Box>
        );

      // ── Step 4: Review & Confirm ──────────────────────────────────────────────
      case 4:
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Personal</Typography>
            <Grid container spacing={1} mb={2}>
              {[
                ['Full Name', `${form.firstName} ${form.lastName}`],
                ['Date of Birth', form.dateOfBirth],
                ['SSN', `***-**-${form.ssn.slice(-4)}`],
                ['Citizenship', form.countryOfCitizenship],
              ].map(([label, val]) => (
                <React.Fragment key={label}>
                  <Grid item xs={5}><Typography variant="body2" color="text.secondary">{label}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" fontWeight={500}>{val}</Typography></Grid>
                </React.Fragment>
              ))}
            </Grid>

            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Contact</Typography>
            <Grid container spacing={1} mb={2}>
              {[
                ['Phone', form.phoneNumber],
                ['Address', `${form.streetAddress}, ${form.city}, ${form.state} ${form.zipCode}`],
              ].map(([label, val]) => (
                <React.Fragment key={label}>
                  <Grid item xs={5}><Typography variant="body2" color="text.secondary">{label}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" fontWeight={500}>{val}</Typography></Grid>
                </React.Fragment>
              ))}
            </Grid>

            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Financial</Typography>
            <Grid container spacing={1} mb={2}>
              {[
                ['Annual Income', `$${parseFloat(form.annualIncome).toLocaleString()}`],
                ['Employment', EMPLOYMENT_STATUSES.find((e) => e.value === form.employmentStatus)?.label ?? ''],
              ].map(([label, val]) => (
                <React.Fragment key={label}>
                  <Grid item xs={5}><Typography variant="body2" color="text.secondary">{label}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" fontWeight={500}>{val}</Typography></Grid>
                </React.Fragment>
              ))}
            </Grid>

            <Divider sx={{ mb: 2 }} />
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.agreedToTerms}
                  onChange={(e) => set('agreedToTerms', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I confirm the information above is accurate and I agree to the{' '}
                  <strong>SecureBank Checking Account Terms</strong> including no monthly fees,
                  no paper checks, and no overdraft features.
                </Typography>
              }
            />
            {errors.agreedToTerms && (
              <Typography variant="caption" color="error" display="block" mt={0.5}>
                {errors.agreedToTerms}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <Box maxWidth={700} mx="auto">
        <Box mb={3}>
          <Typography variant="h4" fontWeight={700}>Open a Checking Account</Typography>
          <Typography color="text.secondary">
            Complete the application below — takes about 3 minutes.
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>{STEPS[activeStep]}</Typography>
            {renderStep()}
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined" onClick={activeStep === 0 ? () => navigate('/accounts') : handleBack}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              {activeStep === 3 ? 'Looks Good' : 'Continue'}
            </Button>
          ) : (
            <Button
              variant="contained" onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {submitting ? 'Opening Account…' : 'Open My Checking Account'}
            </Button>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
};

export default OpenCheckingAccountPage;
