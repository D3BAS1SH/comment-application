import client from './axios.client';
import type {
	AxiosError,
	InternalAxiosRequestConfig,
	AxiosResponse,
} from 'axios';

const publicRoutes = ['/api/v1/auth/register', '/api/v1/auth/login'];

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

function isPublicEndpoint(config: InternalAxiosRequestConfig): boolean {
	return publicRoutes.some((endpoint) => config.url?.includes(endpoint));
}

async function refreshToken(): Promise<string> {
	const response: AxiosResponse<{ accessToken: string }> = await client.post(
		'/auth/refresh',
		{
			refreshToken: localStorage.getItem('refreshToken'),
		}
	);
	return response.data.accessToken;
}

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	if (isPublicEndpoint(config)) return config;

	const token = localStorage.getItem('accessToken');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

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
			(error.response.data as any)?.errorCode === 'ACCESS_TOKEN_EXPIRED' &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;

			if (!isRefreshing) {
				isRefreshing = true;
				try {
					const newToken = await refreshToken();
					localStorage.setItem('accessToken', newToken);
					pendingRequests.forEach((cb) => cb(newToken));
					pendingRequests = [];
					originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
					return client(originalRequest);
				} catch (refreshError) {
					pendingRequests.forEach((cb) => cb(''));
					pendingRequests = [];
					localStorage.removeItem('accessToken');
					localStorage.removeItem('refreshToken');
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
