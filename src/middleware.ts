import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from './lib/firebase/firebase-admin';

// Initialize Firebase Admin Auth
const auth = getAuth(adminApp);

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/dashboard/settings',
  '/dashboard/billing',
  '/dashboard/team',
];

// Paths that are accessible only for guests (non-authenticated users)
const guestOnlyPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is for guests only
  const isGuestOnlyPath = guestOnlyPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Validate the token for protected routes
  if (isProtectedPath) {
    if (!token) {
      // Redirect to login if no token is found
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify token with Firebase Admin
      await auth.verifyIdToken(token);
      
      // Token is valid, allow access to protected route
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      console.error('Invalid token:', error);
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // For guest-only routes, redirect authenticated users to dashboard
  if (isGuestOnlyPath && token) {
    try {
      // Verify token with Firebase Admin
      await auth.verifyIdToken(token);
      
      // Token is valid, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Token is invalid, allow access to guest route
      return NextResponse.next();
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected paths
    '/dashboard/:path*',
    // Match all auth paths
    '/auth/:path*',
  ],
};