import { UserRegister } from '@/features/auth/types/user.interface';
import { AuthService } from '@/server/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body: UserRegister = await req.json();
    const result = await AuthService.register(body);

    if (result.error) {
      return NextResponse.json(
        {
          message: result.error.message,
          errorCode: result.error.errorCode,
        },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch {
    // Failsafe for syntax errors in the Node layer
    return NextResponse.json(
      { message: 'Internal Server Error', errorCode: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
