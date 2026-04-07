import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { CreatePaymentRequest, PageResponse, Payment } from '../../types';

interface PaymentsState {
  payments: Payment[];
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  totalPages: 0,
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchAll',
  async ({ page = 0, size = 20 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: PageResponse<Payment> }>(
        `/api/payments?page=${page}&size=${size}`
      );
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const schedulePayment = createAsyncThunk('payments/create', async (request: CreatePaymentRequest, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<{ data: Payment }>('/api/payments', request);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to schedule payment');
  }
});

export const cancelPayment = createAsyncThunk('payments/cancel', async (paymentId: number, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/api/payments/${paymentId}`);
    return paymentId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel payment');
  }
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => { state.loading = true; })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.content;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPayments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(schedulePayment.fulfilled, (state, action) => { state.payments.unshift(action.payload); })
      .addCase(cancelPayment.fulfilled, (state, action) => {
        const payment = state.payments.find((p) => p.paymentId === action.payload);
        if (payment) payment.status = 'CANCELLED';
      });
  },
});

export const { clearError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
