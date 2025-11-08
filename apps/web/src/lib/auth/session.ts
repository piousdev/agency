import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

/**
 * Session user type with all available fields
 * Extended from BetterAuth session to include custom fields
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  isInternal?: boolean;
  expiresAt?: string | null;
}

/**
 * Full session type returned by getSession
 */
export interface SessionData {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: SessionUser;
}

/**
 * Layer 2: Server-Side Session Validation
 *
 * These utilities provide SECURE session validation for Server Components
 * and Server Actions. They perform full database validation via the Hono API.
 *
 * Usage in Server Components:
 * ```tsx
 * export default async function ProtectedPage() {
 *   const session = await requireAuth(); // Redirects if not authenticated
 *   return <div>Welcome {session.user.name}</div>;
 * }
 * ```
 *
 * Usage in Server Actions:
 * ```tsx
 * export async function deletePost(postId: string) {
 *   "use server";
 *   const session = await requireAuth();
 *   // ... perform authorized mutation
 * }
 * ```
 */

/**
 * Get the current session (may be null)
 * Cached per request to avoid multiple database calls
 */
export const getSession = cache(async (): Promise<SessionData | null> => {
  try {
    const headersList = await headers();

    // Call BetterAuth via Hono API to validate session
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
      headers: {
        cookie: headersList.get('cookie') || '',
      },
      cache: 'no-store', // Always get fresh session data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // BetterAuth returns { session, user } structure
    // Return the full data with both session and user
    if (!data || !data.session || !data.user) {
      return null;
    }

    return {
      session: data.session,
      user: data.user,
    };
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
});

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components and Server Actions for protected routes
 *
 * @param redirectTo - Optional custom redirect path after login
 * @returns Session object (guaranteed to exist)
 */
export async function requireAuth(redirectTo?: string): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    const loginUrl = redirectTo ? `/login?returnUrl=${encodeURIComponent(redirectTo)}` : '/login';

    redirect(loginUrl);
  }

  return session;
}

/**
 * Require specific role - throws error if user doesn't have role
 * Use this for role-based access control in Server Components/Actions
 *
 * @param requiredRole - The role name required
 */
export async function requireRole(requiredRole: string): Promise<SessionData> {
  const session = await requireAuth();

  // TODO: Implement role checking once RBAC is fully integrated
  // For now, we check the isInternal flag
  if (requiredRole === 'internal' && !session.user.isInternal) {
    throw new Error('Insufficient permissions');
  }

  return session;
}

/**
 * Check if user has permission (from JSONB permissions field)
 * Use this for fine-grained permission checks
 *
 * @param _permission - Permission string to check (currently unused until RBAC is implemented)
 */
export async function requirePermission(_permission: string): Promise<SessionData> {
  const session = await requireAuth();

  // TODO: Implement permission checking once RBAC is fully integrated
  // This will check the user's roles and their associated permissions

  return session;
}

/**
 * Get user or redirect
 * Convenience method that returns just the user object
 */
export async function requireUser(redirectTo?: string): Promise<SessionUser> {
  const session = await requireAuth(redirectTo);
  return session.user;
}

/**
 * Check if user is authenticated (doesn't redirect)
 * Use this when you want to conditionally show content without redirecting
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
