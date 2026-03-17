import { refreshTokenExtract } from '@/server/bff/auth-guard';
import { AuthService } from '@/server/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await refreshTokenExtract(request);

    if (refreshToken instanceof NextResponse) {
      return NextResponse.json(
        {
          message: refreshToken.statusText,
          errorCode: refreshToken.status,
        },
        {
          status: refreshToken.status,
        }
      );
    }

    const result = await AuthService.refresh(refreshToken);

    if (result.error) {
      return NextResponse.json(
        {
          message: result.error.message,
          errorCode: result.error.errorCode,
        },
        {
          status: result.error.statusCode,
        }
      );
    }

    const response = NextResponse.json(result.data, { status: 200 });

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set({
      name: 'accessToken',
      value: result.data.accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes (in seconds)
      path: '/',
    });

    response.cookies.set({
      name: 'refreshToken',
      value: result.data.refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days (in seconds)
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        errorCode: 'INTERNAL_SERVER_ERROR',
      },
      {
        status: 500,
      }
    );
  }
}
