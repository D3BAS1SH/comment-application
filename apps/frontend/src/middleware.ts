// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

const protectedRoutes = ['/home', '/dashboard', '/app'];
const publicRoutes = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Get accessToken from cookies (correct name!)
  const accessToken = request.cookies.get('accessToken')?.value;

  // If protected route and no token, redirect to login
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify JWT token directly in Next.js
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
      const { payload } = await jwtVerify(accessToken, secret);

      // Token is valid - check user verification status
      if (!payload.isVerified) {
        return NextResponse.redirect(new URL('/verify-email', request.url));
      }

      // If trying to access public routes while authenticated, redirect to home
      if (isPublicRoute && path !== '/') {
        return NextResponse.redirect(new URL('/home', request.url));
      }

      // Add user info to request headers for server components
      const response = NextResponse.next();
      return response;
    } catch (error) {
      // Token is invalid or expired
      console.error('JWT verification failed:', error);

      // Clear invalid cookies
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
