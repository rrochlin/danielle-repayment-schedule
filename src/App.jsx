import { useState, useMemo, useEffect } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Slider,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import SchoolIcon from '@mui/icons-material/School'
import WorkIcon from '@mui/icons-material/Work'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PaymentsIcon from '@mui/icons-material/Payments'
import EditIcon from '@mui/icons-material/Edit'

// Default loan constants
const DEFAULT_CONFIG = {
  annualTuition: 96000,
  quartersPerYear: 3,
  schoolYears: 2,
  annualInterestRate: 8.0,
  loanTermYears: 10,
}

// Ice skater theme - elegant winter colors with professional polish
const theme = createTheme({
  palette: {
    primary: {
      main: '#0091EA',
      light: '#64B5F6',
      dark: '#01579B',
    },
    secondary: {
      main: '#E91E63',
      light: '#F48FB1',
      dark: '#C2185B',
    },
    background: {
      default: '#F0F7FF',
      paper: '#ffffff',
    },
    warning: {
      main: '#AB47BC',
      light: '#CE93D8',
    },
    error: {
      main: '#7C4DFF',
      light: '#B388FF',
    },
    success: {
      main: '#00BFA5',
      light: '#64FFDA',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,145,234,0.08)',
          border: '1px solid rgba(0,145,234,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
})

function calculateSchoolPhase(config) {
  const data = []
  let principal = 0
  let interest = 0
  const totalQuarters = config.schoolYears * config.quartersPerYear
  const quarterlyDisbursement = config.annualTuition / config.quartersPerYear
  const monthlyInterestRate = config.annualInterestRate / 100 / 12

  data.push({ month: 0, principal: 0, interest: 0, balance: 0 })

  for (let quarter = 0; quarter < totalQuarters; quarter++) {
    const quarterStartMonth = quarter * 3
    principal += quarterlyDisbursement

    for (let monthInQuarter = 0; monthInQuarter < 3; monthInQuarter++) {
      const month = quarterStartMonth + monthInQuarter + 1

      const interestAccrued = (principal + interest) * monthlyInterestRate
      interest += interestAccrued

      const balance = principal + interest
      data.push({ month, principal, interest, balance })
    }
  }

  return data
}

function calculateRepaymentPhase(startingPrincipal, startingInterest, monthlyPayment, config) {
  const data = []
  let remainingPrincipal = startingPrincipal
  let accumulatedInterest = startingInterest
  const totalQuarters = config.schoolYears * config.quartersPerYear
  const schoolEndMonth = totalQuarters * 3
  const monthlyInterestRate = config.annualInterestRate / 100 / 12
  let month = schoolEndMonth
  let totalPaid = 0

  const MAX_MONTHS = 50 * 12 + schoolEndMonth

  while (remainingPrincipal > 0.01 && month < MAX_MONTHS) {
    const interestThisMonth = remainingPrincipal * monthlyInterestRate
    accumulatedInterest += interestThisMonth

    let payment = Math.min(monthlyPayment, remainingPrincipal + accumulatedInterest)
    totalPaid += payment

    if (payment >= accumulatedInterest) {
      payment -= accumulatedInterest
      accumulatedInterest = 0
      remainingPrincipal -= payment
    } else {
      accumulatedInterest -= payment
    }

    if (remainingPrincipal < 0) remainingPrincipal = 0
    if (accumulatedInterest < 0) accumulatedInterest = 0

    month++
    const balance = remainingPrincipal + accumulatedInterest
    data.push({ month, principal: remainingPrincipal, interest: accumulatedInterest, balance, totalPaid })
  }

  return data
}

function calculateLoanTimeline(monthlyPayment, config) {
  const schoolPhase = calculateSchoolPhase(config)
  const lastSchoolData = schoolPhase[schoolPhase.length - 1]
  const graduationBalance = lastSchoolData.balance
  const graduationPrincipal = lastSchoolData.principal
  const graduationInterest = lastSchoolData.interest
  const monthlyInterestRate = config.annualInterestRate / 100 / 12

  const minimumPayment = graduationBalance * monthlyInterestRate

  if (monthlyPayment <= minimumPayment) {
    return {
      timeline: schoolPhase,
      graduationBalance,
      graduationPrincipal,
      graduationInterest,
      payoffMonths: Infinity,
      totalPaid: 0,
      totalInterestPaid: 0,
      insufficientPayment: true,
    }
  }

  const repaymentPhase = calculateRepaymentPhase(
    graduationPrincipal,
    graduationInterest,
    monthlyPayment,
    config
  )

  const timeline = [...schoolPhase, ...repaymentPhase]
  const lastPayment = repaymentPhase[repaymentPhase.length - 1]
  const totalPaid = lastPayment?.totalPaid || 0
  const totalInterestPaid = totalPaid - graduationPrincipal

  return {
    timeline,
    graduationBalance,
    graduationPrincipal,
    graduationInterest,
    payoffMonths: repaymentPhase.length,
    totalPaid,
    totalInterestPaid,
    insufficientPayment: false,
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDuration(months) {
  if (months === Infinity || isNaN(months)) {
    return 'Payment too low'
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`
  } else {
    return `${years}y ${remainingMonths}m`
  }
}

function calculateSuggestedPayment(principal, annualRate, termYears) {
  const monthlyRate = annualRate / 100 / 12
  const numPayments = termYears * 12

  if (monthlyRate === 0) {
    return principal / numPayments
  }

  const payment =
    principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)

  return Math.round(payment)
}

function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('loanConfig')
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG
  })

  const initialSuggestedPayment = useMemo(() => {
    const schoolPhase = calculateSchoolPhase(DEFAULT_CONFIG)
    const graduationBalance = schoolPhase[schoolPhase.length - 1].balance
    return calculateSuggestedPayment(graduationBalance, DEFAULT_CONFIG.annualInterestRate, DEFAULT_CONFIG.loanTermYears)
  }, [])

  const [monthlyPayment, setMonthlyPayment] = useState(() => {
    const saved = localStorage.getItem('monthlyPayment')
    return saved ? parseInt(saved, 10) : initialSuggestedPayment
  })

  useEffect(() => {
    localStorage.setItem('loanConfig', JSON.stringify(config))
  }, [config])

  useEffect(() => {
    localStorage.setItem('monthlyPayment', monthlyPayment.toString())
  }, [monthlyPayment])

  const loanData = useMemo(
    () => calculateLoanTimeline(monthlyPayment, config),
    [monthlyPayment, config]
  )

  const {
    timeline,
    graduationBalance,
    graduationPrincipal,
    graduationInterest,
    payoffMonths,
    totalPaid,
    totalInterestPaid,
  } = loanData

  const totalQuarters = config.schoolYears * config.quartersPerYear
  const graduationMonth = totalQuarters * 3
  const quarterlyDisbursement = config.annualTuition / config.quartersPerYear

  const suggestedPayment = useMemo(
    () => calculateSuggestedPayment(graduationBalance, config.annualInterestRate, config.loanTermYears),
    [graduationBalance, config.annualInterestRate, config.loanTermYears]
  )

  const months = timeline.map((d) => d.month)
  const principals = timeline.map((d) => d.principal)
  const interests = timeline.map((d) => d.interest)

  const handleSliderChange = (event, newValue) => {
    setMonthlyPayment(newValue)
  }

  const handleConfigChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const isPaymentBelowSuggested = monthlyPayment < suggestedPayment

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0091EA 0%, #00BFA5 100%)',
            py: 4,
            px: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,145,234,0.15)',
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h3" sx={{ color: 'white', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ⛸️ Loan Repayment Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Medical School Financial Planning
                </Typography>
              </Box>
              <Chip
                icon={<SchoolIcon />}
                label="Future Doctor"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 1,
                  py: 2.5,
                }}
              />
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl">
          {/* Key Metrics Dashboard */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Editable Loan Parameters Card */}
            <Grid item xs={12} md={5}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #0091EA 0%, #01579B 100%)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        Loan Configuration
                      </Typography>
                    </Stack>
                    <Tooltip title="Edit values below">
                      <EditIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Annual Tuition"
                        type="number"
                        value={config.annualTuition}
                        onChange={handleConfigChange('annualTuition')}
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' },
                            '& input': { color: 'white' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                          '& .MuiInputAdornment-root': { color: 'white' },
                          '& .MuiInputAdornment-root .MuiTypography-root': { color: 'white' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Interest Rate"
                        type="number"
                        value={config.annualInterestRate}
                        onChange={handleConfigChange('annualInterestRate')}
                        size="small"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        inputProps={{ step: 0.1, min: 0, max: 30 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' },
                            '& input': { color: 'white' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                          '& .MuiInputAdornment-root': { color: 'white' },
                          '& .MuiInputAdornment-root .MuiTypography-root': { color: 'white' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="School Years"
                        type="number"
                        value={config.schoolYears}
                        onChange={handleConfigChange('schoolYears')}
                        size="small"
                        inputProps={{ min: 1, max: 10 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' },
                            '& input': { color: 'white' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Quarters/Year"
                        type="number"
                        value={config.quartersPerYear}
                        onChange={handleConfigChange('quartersPerYear')}
                        size="small"
                        inputProps={{ min: 1, max: 4 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' },
                            '& input': { color: 'white' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Repayment Term"
                        type="number"
                        value={config.loanTermYears}
                        onChange={handleConfigChange('loanTermYears')}
                        size="small"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">years</InputAdornment>,
                        }}
                        inputProps={{ min: 1, max: 30 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' },
                            '& input': { color: 'white' },
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                          '& .MuiInputAdornment-root': { color: 'white' },
                          '& .MuiInputAdornment-root .MuiTypography-root': { color: 'white' },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 3 }} />

                  <Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                      {formatCurrency(graduationBalance)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      Total at Graduation
                    </Typography>
                  </Box>

                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Principal:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatCurrency(graduationPrincipal)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Interest Accrued:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatCurrency(graduationInterest)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Analysis */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ bgcolor: 'success.main', color: 'white', height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <AttachMoneyIcon sx={{ fontSize: 28 }} />
                        <Typography variant="h6">Suggested Payment</Typography>
                      </Stack>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatCurrency(suggestedPayment)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        For {config.loanTermYears}-year term
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                        Pays off in exactly {formatDuration(config.loanTermYears * 12)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <TrendingUpIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                        <Typography variant="h6" color="text.primary">
                          Total Interest
                        </Typography>
                      </Stack>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'warning.main' }}>
                        {formatCurrency(totalInterestPaid)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Over life of loan
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {totalPaid > 0 ? ((totalInterestPaid / totalPaid) * 100).toFixed(1) : 0}% of total payments
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <PaymentsIcon sx={{ color: 'error.main', fontSize: 28 }} />
                        <Typography variant="h6" color="text.primary">
                          Total Paid
                        </Typography>
                      </Stack>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
                        {formatCurrency(totalPaid)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actual payoff: {formatDuration(payoffMonths)}
                        {isPaymentBelowSuggested && (
                          <Chip
                            label="Slower than suggested term"
                            size="small"
                            color="warning"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Interactive Chart Section */}
          <Paper
            sx={{
              p: 0,
              mb: 4,
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #ffffff 0%, #F0F7FF 100%)',
            }}
          >
            {/* Chart Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #0091EA 0%, #00BFA5 100%)',
              p: 3,
              color: 'white',
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                ⛸️ Loan Balance Timeline
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                Visualize your journey from medical school through loan payoff
              </Typography>
            </Box>

            {/* Interactive Controls */}
            <Box sx={{ p: 3, bgcolor: 'white' }}>
              {isPaymentBelowSuggested && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <strong>Tip:</strong> Your current payment ({formatCurrency(monthlyPayment)}/month) is below the suggested amount.
                  Consider {formatCurrency(suggestedPayment)}/month to pay off in {config.loanTermYears} years.
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    MONTHLY PAYMENT
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700, lineHeight: 1 }}>
                      {formatCurrency(monthlyPayment)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {monthlyPayment > suggestedPayment
                        ? `${formatDuration(payoffMonths)} (faster than ${config.loanTermYears}y target)`
                        : monthlyPayment === suggestedPayment
                        ? `Exactly ${config.loanTermYears} years`
                        : `${formatDuration(payoffMonths)} (longer than ${config.loanTermYears}y target)`
                      }
                    </Typography>
                  </Box>
                </Stack>

                <Slider
                  value={monthlyPayment}
                  onChange={handleSliderChange}
                  min={500}
                  max={15000}
                  step={100}
                  marks={[
                    { value: 500, label: '$500' },
                    { value: suggestedPayment, label: `${config.loanTermYears}y goal` },
                    { value: 10000, label: '$10k' },
                    { value: 15000, label: '$15k' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  sx={{
                    mt: 2,
                    '& .MuiSlider-thumb': {
                      width: 32,
                      height: 32,
                      boxShadow: '0 4px 12px rgba(0,145,234,0.4)',
                      background: 'linear-gradient(135deg, #0091EA 0%, #00BFA5 100%)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,145,234,0.5)',
                      },
                    },
                    '& .MuiSlider-track': {
                      height: 12,
                      background: 'linear-gradient(90deg, #0091EA 0%, #00BFA5 100%)',
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      height: 12,
                      opacity: 0.2,
                      bgcolor: 'primary.main',
                    },
                    '& .MuiSlider-mark': {
                      bgcolor: 'transparent',
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                    },
                    '& .MuiSlider-valueLabel': {
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    },
                  }}
                />
              </Box>

              {/* Phase Indicators */}
              <Stack direction="row" spacing={3} sx={{ mt: 3, mb: 2, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 24,
                    height: 12,
                    bgcolor: '#0091EA',
                    borderRadius: 1,
                  }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Principal (Borrowed)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 24,
                    height: 12,
                    bgcolor: '#AB47BC',
                    borderRadius: 1,
                  }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Interest (Cost of Loan)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    🎓 = Graduation
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Chart */}
            <Box sx={{
              width: '100%',
              height: 550,
              p: 3,
              background: 'linear-gradient(180deg, #ffffff 0%, #F0F7FF 100%)',
            }}>
              <LineChart
                xAxis={[
                  {
                    data: months,
                    label: 'Timeline (Months)',
                    valueFormatter: (value) => {
                      const years = Math.floor(value / 12)
                      const monthsRemainder = value % 12
                      if (value === 0) return 'Start'
                      if (value === graduationMonth) return '🎓'
                      if (monthsRemainder === 0) return `${years}y`
                      return ''
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Balance',
                    valueFormatter: (value) => {
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}k`
                      }
                      return formatCurrency(value)
                    },
                  },
                ]}
                series={[
                  {
                    data: principals,
                    label: 'Principal',
                    color: '#0091EA',
                    area: true,
                    stack: 'total',
                    showMark: false,
                    curve: 'monotoneX',
                  },
                  {
                    data: interests,
                    label: 'Interest',
                    color: '#AB47BC',
                    area: true,
                    stack: 'total',
                    showMark: false,
                    curve: 'monotoneX',
                  },
                ]}
                grid={{
                  horizontal: true,
                  vertical: false,
                }}
                margin={{ top: 10, right: 40, bottom: 60, left: 90 }}
                slotProps={{
                  legend: {
                    hidden: true,
                  },
                }}
                sx={{
                  '& .MuiLineElement-root': {
                    strokeWidth: 3,
                  },
                  '& .MuiAreaElement-series-Principal': {
                    fill: 'url(#principalGradient)',
                  },
                  '& .MuiAreaElement-series-Interest': {
                    fill: 'url(#interestGradient)',
                  },
                }}
              />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="principalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0091EA" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0091EA" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="interestGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#AB47BC" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#AB47BC" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </Box>
          </Paper>

          {/* Information Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon /> Training Phase (Medical School)
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  During your {config.schoolYears}-year medical school journey, loans are disbursed quarterly
                  ({formatCurrency(quarterlyDisbursement)}/quarter) and interest accrues at {config.annualInterestRate}%.
                  Like perfecting your triple axel, this phase is about building your foundation—no payments required yet.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'secondary.light', color: 'white' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon /> Performance Phase (Residency & Beyond)
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  After graduation, you'll begin making monthly payments. Payments apply to interest first, then principal.
                  The slider above lets you choreograph different payment scenarios—find the routine that helps you
                  stick the landing! 🎭
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
