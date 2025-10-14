import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getAccessToken } from '@/lib/redux/hooks/user.hooks';
import type { InternalAxiosRequestConfig } from 'axios';

// Base axios client for core config and retry logic
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL_LOCAL, // configurable per environment
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define public routes that don't need authentication
export const publicRoutes = ['/api/v1/auth/register', '/api/v1/auth/login'];

export function isPublicEndpoint(config: InternalAxiosRequestConfig): boolean {
  return publicRoutes.some((endpoint: string) =>
    config.url?.includes(endpoint)
  );
}

// Add request interceptor to dynamically get token from Redux
client.interceptors.request.use((config) => {
  // Skip token injection for public endpoints
  if (isPublicEndpoint(config)) return config;

  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosRetry(client, {
  retries: 3,
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    axiosRetry.isRetryableError(error) ||
    [429, 502, 503].includes(error.response?.status ?? 0),
});

export default client;
