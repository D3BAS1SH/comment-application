import { jwtVerify } from 'jose';

export interface tokenPayload {
  sub: string;
  email: string;
  isVerified: boolean;
  iat?: number;
  exp?: number;
  sessionToken: string;
}

const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export async function verifyAccessToken(token: string): Promise<tokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as tokenPayload;
}

export function extractTokenFromCookies(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/accessToken=([^;]+)/);
  return match ? match[1] : null;
}
