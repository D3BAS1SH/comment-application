import client from './axios.client';
import type {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { getRefreshToken } from '@/lib/redux/hooks/user.hooks';
import store from '@/lib/redux/store';
import { logout } from '@/lib/redux/features/userSlice';

// Import public routes function from client
import { isPublicEndpoint } from './axios.client';
import { CustomErrorResponseDto } from '@/types/custom-error-response.interface';

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

async function refreshToken(): Promise<string> {
  const refreshTokenValue = getRefreshToken();
  const response: AxiosResponse<{ accessToken: string }> = await client.post(
    '/auth/refresh',
    {
      refreshToken: refreshTokenValue,
    }
  );
  return response.data.accessToken;
}

// Note: We removed the duplicate request interceptor
// The token injection is already handled in axios.client.ts

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!originalRequest) return Promise.reject(error);
    if (isPublicEndpoint(originalRequest)) return Promise.reject(error);

    // Check for expired access token condition
    if (
      error.response?.status === 401 &&
      (error.response.data as CustomErrorResponseDto)?.errorCode ===
        'ACCESS_TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          // Update token in Redux instead of localStorage
          store.dispatch({ type: 'user/tokenRefreshed', payload: newToken });
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          pendingRequests.forEach((cb) => cb(''));
          pendingRequests = [];
          // Dispatch logout action to clear tokens in Redux
          store.dispatch(logout());
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token: string) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(client(originalRequest));
            } else {
              reject(new Error('Failed to refresh token'));
            }
          });
        });
      }
    }

    return Promise.reject(error);
  }
);
export default client;
