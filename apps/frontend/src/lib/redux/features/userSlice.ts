import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient, { NormalizedError } from '@/lib/api/api-client';
import {
  UserLogin,
  UserLoginResponse,
  UserRegister,
  UserRegisterResponse,
  UserState,
} from '@/features/auth/types/user.interface';

const initialState: UserState = {
  id: null,
  firstName: null,
  lastName: null,
  email: null,
  imageUrl: null,
  isVerified: false,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk<
  UserLoginResponse,
  UserLogin,
  { rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<UserLoginResponse>(
      '/auth/login',
      credentials
    );
    return response.data;
  } catch (error) {
    const err = error as NormalizedError;
    return rejectWithValue(err.message || 'Login failed');
  }
});

/**
 * Async thunk for registration
 */
export const registerUser = createAsyncThunk<
  UserRegisterResponse,
  UserRegister,
  { rejectValue: string }
>('user/register', async (Rcredentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<UserRegisterResponse>(
      '/auth/register',
      Rcredentials
    );
    return response.data;
  } catch (error) {
    const err = error as NormalizedError;
    return rejectWithValue(err.message || 'Registration failed');
  }
});

// Async thunk for token refresh
export const refreshAccessToken = createAsyncThunk<
  string, // Returns the new access token
  void,
  { rejectValue: string }
>('user/refreshToken', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh'
    );
    return response.data.accessToken;
  } catch (error) {
    const err = error as NormalizedError;
    return rejectWithValue(err.message || 'Failed to refresh token');
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      const err = error as NormalizedError;
      return rejectWithValue(err.message || 'Failed to logout');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    tokenRefreshed(state, action) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.id = payload.id ?? null;
        state.firstName = payload.firstName ?? null;
        state.lastName = payload.lastName ?? null;
        state.email = payload.email ?? null;
        state.imageUrl = payload.imageUrl ?? null;
        state.isVerified = payload.isVerified ?? false;
        state.accessToken = payload.accessToken ?? null;
        state.refreshToken = payload.refreshToken ?? null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.id = null;
        state.firstName = null;
        state.lastName = null;
        state.email = null;
        state.imageUrl = null;
        state.isVerified = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { tokenRefreshed } = userSlice.actions;
export default userSlice.reducer;
