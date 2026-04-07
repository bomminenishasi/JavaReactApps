// ─── Auth ───────────────────────────────────────────────────────────────────
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

// ─── User ────────────────────────────────────────────────────────────────────
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

// ─── Accounts ────────────────────────────────────────────────────────────────
export interface Account {
  accountId: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
}

export interface CreateAccountRequest {
  accountType: 'SAVINGS' | 'CHECKING';
  currency?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
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

// ─── API ──────────────────────────────────────────────────────────────────────
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
