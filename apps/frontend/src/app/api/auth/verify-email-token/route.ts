import { AuthService } from '@/server/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        {
          message: 'Token not found',
          errorCode: 'TOKEN_NOT_FOUND',
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await AuthService.verifyEmailToken(token);

    if (error) {
      return NextResponse.json(
        {
          message: error.message,
          errorCode: error.errorCode,
        },
        {
          status: error.statusCode,
        }
      );
    }

    const response = NextResponse.json(data, { status: 200 });

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
