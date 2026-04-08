import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { RewardsSummary, RewardTransaction, RedeemRequest, PageResponse } from '../../types';

interface RewardsState {
  summary: RewardsSummary | null;
  history: RewardTransaction[];
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
}

const initialState: RewardsState = {
  summary: null,
  history: [],
  loading: false,
  historyLoading: false,
  error: null,
};

export const fetchRewardsSummary = createAsyncThunk(
  'rewards/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: RewardsSummary }>('/api/rewards');
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch rewards');
    }
  }
);

export const fetchRewardsHistory = createAsyncThunk(
  'rewards/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: PageResponse<RewardTransaction> }>('/api/rewards/history');
      return data.data.content ?? [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch rewards history');
    }
  }
);

export const redeemPoints = createAsyncThunk(
  'rewards/redeem',
  async (request: RedeemRequest, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/api/rewards/redeem', request);
      // Refresh summary & history after successful redemption
      dispatch(fetchRewardsSummary());
      dispatch(fetchRewardsHistory());
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Redemption failed');
    }
  }
);

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // summary
      .addCase(fetchRewardsSummary.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRewardsSummary.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; })
      .addCase(fetchRewardsSummary.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // history
      .addCase(fetchRewardsHistory.pending, (state) => { state.historyLoading = true; })
      .addCase(fetchRewardsHistory.fulfilled, (state, action) => { state.historyLoading = false; state.history = action.payload; })
      .addCase(fetchRewardsHistory.rejected, (state, action) => { state.historyLoading = false; state.error = action.payload as string; })
      // redeem
      .addCase(redeemPoints.rejected, (state, action) => { state.error = action.payload as string; });
  },
});

export const { clearError } = rewardsSlice.actions;
export default rewardsSlice.reducer;
