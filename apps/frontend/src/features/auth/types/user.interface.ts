export interface UserState {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  imageUrl?: string;
}

export interface UploadUrlResponse {
  timestamp: number;
  folder: string;
  api_key: string;
  signature: string;
  uploadUrl: string;
  upload_preset: string;
}

export interface UserLoginResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  createdAt?: Date;
  isVerified: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface UserRegisterResponse {
  message: string;
}

export interface UserVerificationTokenResponse {
  isVerified: boolean;
  email: string;
  message: string;
}

export interface ResetPasswordToken {
  password: string;
  token: string;
}

export interface ResetPasswordTokenResponse {
  message: string;
}

/**
 * Do not use it in the Forget password server auth service's class method
 */
export interface ForgetPasswordInitiateResponse {
  message: string;
}
