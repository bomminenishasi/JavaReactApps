import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { CreditCard, ApplyCardRequest, CardPaymentRequest } from '../../types';

interface CreditCardState {
  cards: CreditCard[];
  loading: boolean;
  error: string | null;
}

const initialState: CreditCardState = {
  cards: [],
  loading: false,
  error: null,
};

export const fetchCreditCards = createAsyncThunk(
  'creditCards/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: CreditCard[] }>('/api/credit-cards');
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch credit cards');
    }
  }
);

export const applyForCard = createAsyncThunk(
  'creditCards/apply',
  async (request: ApplyCardRequest, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<{ data: CreditCard }>('/api/credit-cards', request);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Card application failed');
    }
  }
);

export const makeCreditCardPayment = createAsyncThunk(
  'creditCards/payment',
  async ({ cardId, request }: { cardId: number; request: CardPaymentRequest }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<{ data: CreditCard }>(
        `/api/credit-cards/${cardId}/payment`,
        request
      );
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Payment failed');
    }
  }
);

const creditCardSlice = createSlice({
  name: 'creditCards',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchCreditCards.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCreditCards.fulfilled, (state, action) => { state.loading = false; state.cards = action.payload; })
      .addCase(fetchCreditCards.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // apply
      .addCase(applyForCard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(applyForCard.fulfilled, (state, action) => { state.loading = false; state.cards.unshift(action.payload); })
      .addCase(applyForCard.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // payment
      .addCase(makeCreditCardPayment.fulfilled, (state, action) => {
        const idx = state.cards.findIndex((c) => c.cardId === action.payload.cardId);
        if (idx !== -1) state.cards[idx] = action.payload;
      })
      .addCase(makeCreditCardPayment.rejected, (state, action) => { state.error = action.payload as string; });
  },
});

export const { clearError } = creditCardSlice.actions;
export default creditCardSlice.reducer;
