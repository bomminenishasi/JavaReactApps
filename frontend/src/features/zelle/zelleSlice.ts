import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ZelleTransfer, SendZelleRequest, ZelleContacts, PageResponse } from '../../types';

interface ZelleState {
  history: ZelleTransfer[];
  contacts: ZelleContacts;
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ZelleState = {
  history: [],
  contacts: { emails: [], phones: [] },
  loading: false,
  sending: false,
  error: null,
};

export const fetchZelleHistory = createAsyncThunk(
  'zelle/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: PageResponse<ZelleTransfer> }>('/api/zelle/history');
      return data.data.content ?? [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transfer history');
    }
  }
);

export const fetchZelleContacts = createAsyncThunk(
  'zelle/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<{ data: ZelleContacts }>('/api/zelle/contacts');
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contacts');
    }
  }
);

export const sendZelle = createAsyncThunk(
  'zelle/send',
  async (request: SendZelleRequest, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<{ data: ZelleTransfer }>('/api/zelle/send', request);
      dispatch(fetchZelleHistory());
      dispatch(fetchZelleContacts());
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Transfer failed');
    }
  }
);

const zelleSlice = createSlice({
  name: 'zelle',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // history
      .addCase(fetchZelleHistory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchZelleHistory.fulfilled, (state, action) => { state.loading = false; state.history = action.payload; })
      .addCase(fetchZelleHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // contacts
      .addCase(fetchZelleContacts.fulfilled, (state, action) => { state.contacts = action.payload; })
      // send
      .addCase(sendZelle.pending, (state) => { state.sending = true; state.error = null; })
      .addCase(sendZelle.fulfilled, (state) => { state.sending = false; })
      .addCase(sendZelle.rejected, (state, action) => { state.sending = false; state.error = action.payload as string; });
  },
});

export const { clearError } = zelleSlice.actions;
export default zelleSlice.reducer;
