import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { DepositWithdrawRequest, PageResponse, Transaction, TransferRequest } from '../../types';

interface TransactionsState {
  transactions: Transaction[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async ({ accountId, page = 0, size = 20 }: { accountId: number; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: PageResponse<Transaction> }>(
        `/api/transactions?accountId=${accountId}&page=${page}&size=${size}`
      );
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const transferFunds = createAsyncThunk('transactions/transfer', async (request: TransferRequest, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<{ data: Transaction }>('/api/transactions/transfer', request);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Transfer failed');
  }
});

export const depositFunds = createAsyncThunk('transactions/deposit', async (request: DepositWithdrawRequest, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<{ data: Transaction }>('/api/transactions/deposit', request);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Deposit failed');
  }
});

export const withdrawFunds = createAsyncThunk('transactions/withdraw', async (request: DepositWithdrawRequest, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<{ data: Transaction }>('/api/transactions/withdraw', request);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Withdrawal failed');
  }
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(transferFunds.fulfilled, (state, action) => { state.transactions.unshift(action.payload); })
      .addCase(depositFunds.fulfilled, (state, action) => { state.transactions.unshift(action.payload); })
      .addCase(withdrawFunds.fulfilled, (state, action) => { state.transactions.unshift(action.payload); });
  },
});

export const { clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
