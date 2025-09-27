import axios from 'axios';
import axiosRetry from 'axios-retry';

// Base axios client for core config and retry logic
const client = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL_LOCAL, // configurable per environment
	timeout: 10000,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
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
