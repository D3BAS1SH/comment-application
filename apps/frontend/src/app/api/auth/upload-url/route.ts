import { AuthService } from '@/server/services/auth.service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await AuthService.getUploadUrl();

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
