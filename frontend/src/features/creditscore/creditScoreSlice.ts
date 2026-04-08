import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { CreditScore } from '../../types';

interface CreditScoreState {
  data: CreditScore | null;
  loading: boolean;
  error: string | null;
}

const initialState: CreditScoreState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchCreditScore = createAsyncThunk(
  'creditScore/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/api/credit-score');
      return res.data.data as CreditScore;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load credit score');
    }
  }
);

const creditScoreSlice = createSlice({
  name: 'creditScore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditScore.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCreditScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default creditScoreSlice.reducer;
