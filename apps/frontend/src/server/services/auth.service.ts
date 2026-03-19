import { authClient } from '../http/clients';
import { handleAxiosError, ServiceError } from '@/utils/service-error';
import {
  UserLogin,
  UserRegister,
  UserLoginResponse,
  UserRegisterResponse,
  UploadUrlResponse,
  UserVerificationTokenResponse,
  ResetPasswordToken,
  ResetPasswordTokenResponse,
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
        '/users/login',
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
        '/users/register',
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
        '/users/logout',
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
        '/users/refresh',
        { refreshToken }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Fetches a signed upload URL for Cloudinary via the Cloudinary Utility service.
   */
  static async getUploadUrl(): Promise<ServiceResult<UploadUrlResponse>> {
    try {
      const response = await authClient.get<UploadUrlResponse>(
        '/cloudinary-utility/upload-url'
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Verifies a user's email token via the Users service.
   * @param token The verification token sent to the user's email.
   */
  static async verifyEmailToken(
    token: string
  ): Promise<ServiceResult<UserVerificationTokenResponse>> {
    try {
      const response = await authClient.get<UserVerificationTokenResponse>(
        `/users/verify-email?token=${token}`
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Initiates the forget password process by sending a reset link to the user's email.
   * @param email The user's registered email address.
   */
  static async forgetPasswordInitiate(
    email: string
  ): Promise<ServiceResult<string>> {
    try {
      const response = await authClient.post<string>('/users/forget-password', {
        email,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Resets the user's password using a valid reset token.
   * @param resetPasswordBody An object containing the new password and the reset token.
   */
  static async resetPassword(
    resetPasswordBody: ResetPasswordToken
  ): Promise<ServiceResult<ResetPasswordTokenResponse>> {
    try {
      const response = await authClient.post<ResetPasswordTokenResponse>(
        '/users/reset-password',
        resetPasswordBody
      );
      return { data: response.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
