export interface tokenPayload {
  sub: string;
  email: string;
  isVerified: boolean;
  iat?: number;
  exp?: number;
  sessionToken: string;
}
