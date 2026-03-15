import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

export function createServiceClient(
  baseURL: string,
  serviceName: string
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Service': 'nextjs-bff',
    },
  });

  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkError(error) ||
      [429, 502, 503].includes(error.response?.status ?? 0),
    onRetry: (retryCount, error) => {
      console.warn(
        `[${serviceName}] Retry attempt ${retryCount} after error: ${error.message}`
      );
    },
  });

  client.interceptors.request.use((config) => {
    config.headers['X-Source-Service'] = serviceName;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        // TypeScript now knows error is AxiosError inside this block
        console.error(
          `[${serviceName}] Request failed:`,
          error.response?.status
        );
      }
      return Promise.reject(error);
    }
  );

  return client;
}
