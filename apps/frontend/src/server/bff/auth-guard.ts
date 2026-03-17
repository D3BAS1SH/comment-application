import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/server/jwt/verify';

export interface AuthContext {
  userId: string;
  email: string;
  isVerified: boolean;
  accessToken: string;
}

export async function authGuard(
  _request: Request
): Promise<AuthContext | NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await verifyAccessToken(accessToken);

    return {
      userId: payload.sub,
      email: payload.email,
      isVerified: payload.isVerified,
      accessToken,
    };
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function refreshTokenExtract(
  _request: Request
): Promise<string | NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return refreshToken;
}
