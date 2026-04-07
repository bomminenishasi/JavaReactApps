import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { UpdateProfileRequest, User } from '../../types';

interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<{ data: User }>('/api/users/profile');
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
  }
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (request: UpdateProfileRequest, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put<{ data: User }>('/api/users/profile', request);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (payload: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.put('/api/users/change-password', payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to change password');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearMessages: (state) => { state.error = null; state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => { state.profile = action.payload; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.profile = action.payload; state.successMessage = 'Profile updated'; })
      .addCase(updateProfile.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(changePassword.fulfilled, (state) => { state.successMessage = 'Password changed successfully'; })
      .addCase(changePassword.rejected, (state, action) => { state.error = action.payload as string; });
  },
});

export const { clearMessages } = userSlice.actions;
export default userSlice.reducer;
