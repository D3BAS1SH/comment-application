import { authGuard } from '@/server/bff/auth-guard';
import { AuthService } from '@/server/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const RequestTokenBody = await authGuard(request);

    if (RequestTokenBody instanceof NextResponse) {
      return NextResponse.json(
        {
          message: RequestTokenBody.statusText,
          errorCode: RequestTokenBody.status,
        },
        {
          status: RequestTokenBody.status,
        }
      );
    }

    const result = await AuthService.logout(RequestTokenBody.accessToken);

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

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

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
