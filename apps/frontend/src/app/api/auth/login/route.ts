import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { UserLogin } from '@/features/auth/types/user.interface';

export async function POST(request: NextRequest) {
  try {
    const body: UserLogin = await request.json();

    // 1. Send the request to the NestJS microservice via our Service Layer
    const result = await AuthService.login(body);

    // 2. If the microservice rejected it (e.g., wrong password), return the exact error
    if (result.error) {
      return NextResponse.json(
        {
          message: result.error.message,
          errorCode: result.error.errorCode,
        },
        { status: result.error.statusCode }
      );
    }

    // 3. Success! Extract the tokens and user data
    const { accessToken, refreshToken, ...userProfile } = result.data;

    // We pass ONLY the safe user profile back to the browser.
    // The tokens are kept entirely out of the JSON response for maximum security.
    const response = NextResponse.json(userProfile, { status: 200 });

    // 4. Secure Authentication: Set the tokens as strictly HTTP-Only cookies.
    // This allows the browser to automatically attach them to future /api/ calls,
    // and JavaScript cannot steal them (XSS protection).
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set({
      name: 'accessToken',
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes (in seconds)
      path: '/',
    });

    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days (in seconds)
      path: '/',
    });

    return response;
  } catch {
    // Failsafe for syntax errors in the Node layer
    return NextResponse.json(
      { message: 'Internal Server Error', errorCode: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
