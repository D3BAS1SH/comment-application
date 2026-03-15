import { authClient } from '../http/clients';
import { handleAxiosError, ServiceError } from '@/utils/service-error';
import {
  UserLogin,
  UserRegister,
  UserLoginResponse,
  UserRegisterResponse,
} from '@/features/auth/types/user.interface';

// For typing the Refresh Token API Response
export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: ServiceError };

export class AuthService {
  /**
   * Logs a user in using email and password.
   */
  static async login(
    credentials: UserLogin
  ): Promise<ServiceResult<UserLoginResponse>> {
    try {
      const response = await authClient.post<UserLoginResponse>(
        '/auth/login',
        credentials
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Registers a new user.
   */
  static async register(
    credentials: UserRegister
  ): Promise<ServiceResult<UserRegisterResponse>> {
    try {
      const response = await authClient.post<UserRegisterResponse>(
        '/auth/register',
        credentials
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Logs out a user by revoking their refresh token via the NestJS Microservice.
   * Requires the valid Access Token forwarding to pass the JwtAuthGuard.
   */
  static async logout(
    accessToken: string
  ): Promise<ServiceResult<{ message: string }>> {
    try {
      // NestJS auth-service JwtAuthGuard specifically checks the Authorization header
      const response = await authClient.post<{ message: string }>(
        '/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Refreshes JWT tokens by passing the old Refresh Token to the backend.
   */
  static async refresh(
    refreshToken: string
  ): Promise<ServiceResult<RefreshTokenResult>> {
    try {
      // NestJS auth-service RefreshStrategy explicitly checks for `refreshToken` in the POST body
      const response = await authClient.post<RefreshTokenResult>(
        '/auth/refresh',
        { refreshToken }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
