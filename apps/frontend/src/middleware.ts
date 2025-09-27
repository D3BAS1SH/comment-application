import { NextResponse } from 'next/server';

export function middleware() {
	// No blocking, no redirects—just let all requests through
	return NextResponse.next();
}

export const config = {
	// Apply this middleware to every route, on every request
	matcher: ['/:path*'],
};
