// =============================================================================
// SecureBank — TypeScript Type Definitions
// =============================================================================

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
export interface Account {
  accountId: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
  // Checking account application fields (populated when accountType === 'CHECKING')
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  ssnLast4?: string;
  countryOfCitizenship?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  annualIncome?: number;
  employmentStatus?: string;
}

/**
 * Used for both SAVINGS (simple) and CHECKING (full application) creation.
 * Checking-specific fields are optional here; the backend enforces them when
 * accountType === 'CHECKING'.
 */
export interface CreateAccountRequest {
  accountType: 'SAVINGS' | 'CHECKING';
  currency?: string;
  // ── Checking account application fields ──────────────────────────────────
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;       // ISO: YYYY-MM-DD
  ssn?: string;               // ###-##-#### (backend stores only last 4)
  countryOfCitizenship?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  annualIncome?: number;
  employmentStatus?: string;
  agreedToTerms?: boolean;
}

// ─── Transactions ──────────────────────────────────────────────────────────────
export interface Transaction {
  txnId: number;
  fromAccountId?: number;
  fromAccountNumber?: string;
  toAccountId?: number;
  toAccountNumber?: string;
  amount: number;
  txnType: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  referenceNo: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

export interface DepositWithdrawRequest {
  accountId: number;
  amount: number;
  description?: string;
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export interface Payment {
  paymentId: number;
  accountId: number;
  accountNumber: string;
  payeeName: string;
  amount: number;
  scheduledDate: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
}

export interface CreatePaymentRequest {
  accountId: number;
  payeeName: string;
  amount: number;
  scheduledDate: string;
}

// ─── Credit Card ──────────────────────────────────────────────────────────────
export interface CreditCard {
  cardId: number;
  cardNumber: string;
  maskedNumber: string;
  cardType: 'STANDARD' | 'GOLD' | 'PLATINUM';
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  dueDate: string;
  minimumPayment: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  rewardPoints: number;
  rewardMultiplier: number;
  createdAt: string;
}

export interface ApplyCardRequest {
  cardType: 'STANDARD' | 'GOLD' | 'PLATINUM';
}

export interface CardPaymentRequest {
  fromAccountId: number;
  amount: number;
}

// ─── Zelle ────────────────────────────────────────────────────────────────────
export interface ZelleTransfer {
  transferId: number;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  amount: number;
  note?: string;
  direction: 'SENT' | 'RECEIVED';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  fromAccountNumber: string;
  createdAt: string;
}

export interface SendZelleRequest {
  fromAccountId: number;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  amount: number;
  note?: string;
}

export interface ZelleContacts {
  emails: string[];
  phones: string[];
}

// ─── Rewards ──────────────────────────────────────────────────────────────────
export interface RewardsSummary {
  rewardId: number;
  totalPoints: number;
  lifetimePoints: number;
  tier: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM';
  tierColor: string;
  nextTierPoints: number;
  pointsToNextTier: number;
  progressPercent: number;
  cashValue: number;
  travelValue: number;
  giftCardValue: number;
}

export interface RewardTransaction {
  rewardTxnId: number;
  points: number;
  txnType: 'EARNED' | 'REDEEMED' | 'BONUS' | 'EXPIRED';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface RedeemRequest {
  points: number;
  redeemType: 'CASH' | 'TRAVEL' | 'GIFT_CARD';
  toAccountId?: number;
}

// ─── Credit Score ─────────────────────────────────────────────────────────────
export interface CreditScore {
  scoreId: number;
  score: number;
  category: string;          // e.g. "Very Good"
  categoryKey: string;       // e.g. "VERY_GOOD"
  color: string;             // hex color for gauge
  paymentHistoryPct: number;
  creditUtilizationPct: number;
  accountAgeMonths: number;
  creditMix: number;
  lastCalculated: string;
  scoreMin: number;          // 300
  scoreMax: number;          // 850
  scorePercent: number;      // 0-100
  tip: string;
}

// ─── Common API wrappers ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
