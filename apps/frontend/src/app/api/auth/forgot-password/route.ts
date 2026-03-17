import { AuthService } from '@/server/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: { email: string } = await request.json();

    const { data, error } = await AuthService.forgetPasswordInitiate(
      body.email
    );

    if (error) {
      return NextResponse.json(
        {
          message: error.message,
          errorCode: error.errorCode,
        },
        { status: error.statusCode }
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
      { status: 500 }
    );
  }
}
