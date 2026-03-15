import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Login failed'
    );
  }
});

/**
 *
 */
export const registerUser = createAsyncThunk<
  UserRegisterResponse,
  UserRegister,
  { rejectValue: string }
>('user/register', async (Rcredentials, { rejectWithValue }) => {
  try {
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Rcredentials),
    });
    const data = await registerResponse.json();
    return data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Registration failed'
    );
  }
});

// Async thunk for token refresh (optional here, can be handled via interceptor)
export const refreshAccessToken = createAsyncThunk(
  'user/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh token'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to logout'
      );
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
