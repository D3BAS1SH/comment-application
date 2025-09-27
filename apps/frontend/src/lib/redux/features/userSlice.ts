import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authClient from '@/lib/http/axios.auth';
import type { AxiosError } from 'axios';
import { UserState } from '@/types/userState.interface';
import { CustomErrorResponseDto } from '@/types/custom-error-response.interface';

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
	any, // replace 'any' with your success response type
	{ email: string; password: string },
	{ rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
	try {
		const response = await authClient.post('/auth/login', credentials);
		return response.data; // your success response containing tokens and user info
	} catch (error) {
		let message = 'Login failed';

		if ((error as AxiosError).response?.data) {
			const data = (error as AxiosError).response
				?.data as CustomErrorResponseDto;
			if (data.message) {
				message = data.message;
			}
		}

		return rejectWithValue(message);
	}
});

// Async thunk for token refresh (optional here, can be handled via interceptor)
export const refreshAccessToken = createAsyncThunk(
	'user/refreshToken',
	async (refreshToken: string, { rejectWithValue }) => {
		try {
			const response = await authClient.post('/auth/refresh', { refreshToken });
			return response.data.accessToken;
		} catch {
			return rejectWithValue('Failed to refresh token');
		}
	}
);

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		logout(state) {
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
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
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
			});
	},
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
