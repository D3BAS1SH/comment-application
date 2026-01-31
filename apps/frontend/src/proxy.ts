// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

const protectedRoutes = ['/home', '/dashboard', '/app'];
const publicRoutes = ['/login', '/register', '/'];

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Runs on the server before a request is completed.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get accessToken from cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // 1. Redirect to login if accessing protected route without token
  if (isProtectedRoute && !accessToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Verify JWT token if present
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
      const { payload } = await jwtVerify(accessToken, secret);

      // Token is valid - check user verification status
      if (!payload.isVerified && pathname !== '/verify-email') {
        return NextResponse.redirect(new URL('/verify-email', request.url));
      }

      // If trying to access public routes while authenticated, redirect to home
      if (isPublicRoute && pathname !== '/') {
        return NextResponse.redirect(new URL('/home', request.url));
      }

      // Professional: Pass user info to Server Components via request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-is-verified', String(payload.isVerified));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token is invalid or expired
      console.error('Proxy authorization failed:', error);

      // Clear invalid cookies and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
