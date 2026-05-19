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

      // Pass user info to Server Components via request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-is-verified', String(payload.isVerified));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      // Access token expired or invalid — attempt a silent refresh
      return silentRefresh(request, isProtectedRoute, isPublicRoute);
    }
  }

  return NextResponse.next();
}

/**
 * Attempts to silently rotate tokens using the refresh token cookie.
 * On success, continues the original request with fresh cookies set.
 * On failure, clears cookies and redirects to login.
 */
async function silentRefresh(
  request: NextRequest,
  isProtectedRoute: boolean,
  isPublicRoute: boolean
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return redirectToLogin(request, isProtectedRoute, pathname);
  }

  try {
    // Call the BFF refresh route (excluded from this matcher, so no loop)
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    const refreshResponse = await fetch(refreshUrl.toString(), {
      method: 'POST',
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!refreshResponse.ok) {
      return redirectToLogin(request, isProtectedRoute, pathname);
    }

    const data: { accessToken: string; refreshToken: string } =
      await refreshResponse.json();

    // Verify the new access token to extract user claims
    const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(data.accessToken, secret);

    // Apply the same routing logic as a freshly verified token
    let response: NextResponse;

    if (!payload.isVerified && pathname !== '/verify-email') {
      response = NextResponse.redirect(new URL('/verify-email', request.url));
    } else if (isPublicRoute && pathname !== '/') {
      response = NextResponse.redirect(new URL('/home', request.url));
    } else {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-is-verified', String(payload.isVerified));
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Attach the rotated tokens as new HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const accessTokenMaxAge = Number(process.env.ACCESS_TOKEN_MAX_AGE);

    response.cookies.set({
      name: 'accessToken',
      value: data.accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: accessTokenMaxAge,
      path: '/',
    });

    response.cookies.set({
      name: 'refreshToken',
      value: data.refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    // Refresh failed — session is dead
    return redirectToLogin(request, isProtectedRoute, pathname);
  }
}

function redirectToLogin(
  request: NextRequest,
  isProtectedRoute: boolean,
  pathname: string
): NextResponse {
  // Only redirect to login for protected routes; let public routes through
  if (!isProtectedRoute) {
    const response = NextResponse.next();
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  const url = new URL('/login?session_expired=true', request.url);
  url.searchParams.set('callbackUrl', pathname);
  const response = NextResponse.redirect(url);
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
