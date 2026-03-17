import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import store from '../redux/store';
import { logoutUser, tokenRefreshed } from '../redux/features/userSlice';

/**
 * Standardized error structure for the frontend application.
 */
export interface NormalizedError {
  message: string;
  errorCode: string;
  status: number;
}

/**
 * Standardized API client for communicating with the Next.js BFF.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

// Flag and queue to handle multiple concurrent 401s
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Interceptor to normalized errors and handle token refresh.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errorCode?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Normalize the error first
    const errorCode = error.response?.data?.errorCode || 'UNKNOWN_ERROR';
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const status = error.response?.status || 500;

    const normalizedError: NormalizedError = { message, errorCode, status };

    // 1. Handle Access Token Expiration
    if (
      status === 401 &&
      errorCode === 'ACCESS_TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post('/api/auth/refresh');
        const { accessToken } = response.data;

        // Update Redux store so UI/Hooks are in sync
        store.dispatch(tokenRefreshed(accessToken));

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        const errorData = (refreshError as AxiosError<{ errorCode?: string }>)
          ?.response?.data;
        const refreshErrorCode = errorData?.errorCode;
        const status = (refreshError as AxiosError)?.response?.status;

        // 2. Handle Refresh Token Expiration or Session Death
        if (refreshErrorCode === 'SESSION_EXPIRED' || status === 401) {
          processQueue(refreshError, null);
          store.dispatch(logoutUser());
          if (typeof window !== 'undefined') {
            window.location.href = '/login?session_expired=true';
          }
        }
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    // 3. Handle Hard Session Expiry (If detected on a normal request)
    if (status === 401 && errorCode === 'SESSION_EXPIRED') {
      store.dispatch(logoutUser());
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session_expired=true';
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
