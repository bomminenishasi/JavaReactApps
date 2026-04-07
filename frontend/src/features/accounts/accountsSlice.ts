import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { Account, CreateAccountRequest } from '../../types';

interface AccountsState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<{ data: Account[] }>('/api/accounts');
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch accounts');
  }
});

export const fetchAccount = createAsyncThunk('accounts/fetchOne', async (accountId: number, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<{ data: Account }>(`/api/accounts/${accountId}`);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch account');
  }
});

export const createAccount = createAsyncThunk('accounts/create', async (request: CreateAccountRequest, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<{ data: Account }>('/api/accounts', request);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create account');
  }
});

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setSelectedAccount: (state, action) => { state.selectedAccount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.loading = true; })
      .addCase(fetchAccounts.fulfilled, (state, action) => { state.loading = false; state.accounts = action.payload; })
      .addCase(fetchAccounts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchAccount.fulfilled, (state, action) => { state.selectedAccount = action.payload; })
      .addCase(createAccount.fulfilled, (state, action) => { state.accounts.unshift(action.payload); });
  },
});

export const { clearError, setSelectedAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
