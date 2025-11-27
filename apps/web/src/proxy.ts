import { type NextRequest, NextResponse } from 'next/server';

import { getSessionCookie } from 'better-auth/cookies';

/**
 * Next.js Proxy - Layer 1: Optimistic Redirect (Edge Runtime)
 *
 * SECURITY NOTE: This performs a fast cookie-only check for UX purposes.
 * It does NOT validate the session - that happens in Server Components.
 *
 * This is the recommended approach from Better-Auth documentation:
 * "This is the recommended approach to optimistically redirect users.
 * We recommend handling auth checks in each page/route"
 *
 * Defense-in-Depth Strategy:
 * 1. Proxy (here) - Fast optimistic redirect based on cookie presence
 * 2. Server Components - Full session validation with database check
 * 3. Server Actions - Additional validation for mutations
 *
 * Performance: ~1ms per request (Edge Runtime)
 * Security: Optimistic only - real auth happens server-side
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Redirect authenticated users away from public auth pages
  if (sessionCookie && isPublicAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (!sessionCookie && isProtectedRoute(pathname)) {
    // Preserve the return URL for post-login redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Protected routes requiring authentication
 * Add your protected route patterns here
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    '/dashboard',
    '/settings',
    '/profile',
    // Add more protected routes
  ];

  return protectedPatterns.some((pattern) => pathname.startsWith(pattern));
}

/**
 * Public authentication routes (login, signup, etc.)
 * Authenticated users should be redirected away from these
 */
function isPublicAuthRoute(pathname: string): boolean {
  const publicAuthRoutes = ['/login', '/signup'];
  return publicAuthRoutes.includes(pathname);
}

/**
 * Proxy configuration
 * Excludes static files, images, and API routes for performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - *.png, *.jpg, *.jpeg, *.gif, *.svg, *.webp (images)
     * - /api/auth/* (BetterAuth handles these)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$|api/auth).*)',
  ],
};
