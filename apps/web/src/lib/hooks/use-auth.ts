/**
 * useAuth Hook - Convenience Wrapper for Better-Auth
 *
 * Server-First Principle: This hook is ONLY for client components that need interactivity.
 * For server-side auth checks, use Server Components with requireUser/requireAuth instead.
 *
 * Usage:
 * ```tsx
 * "use client";
 * import { useAuth } from "@/lib/hooks/use-auth";
 *
 * export function UserMenu() {
 *   const { user, isAuthenticated, isLoading, signOut } = useAuth();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!isAuthenticated) return <SignInButton />;
 *
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger>{user.name}</DropdownMenuTrigger>
 *       <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
 *     </DropdownMenu>
 *   );
 * }
 * ```
 */

'use client';

import { authClient } from '@/lib/auth-client';

/**
 * useAuth Hook
 *
 * Provides convenient access to Better-Auth session data and methods.
 * This is a thin wrapper around Better-Auth's built-in hooks.
 *
 * @returns Auth state and methods
 */
export function useAuth() {
  const session = authClient.useSession();

  return {
    /**
     * Session data (contains both user and session objects)
     * Structure: { user: User, session: Session } | null
     */
    session: session.data,

    /**
     * User object (convenience accessor)
     * null if not authenticated
     */
    user: session.data?.user ?? null,

    /**
     * Session object (convenience accessor)
     * Contains session metadata (id, expiresAt, ipAddress, userAgent)
     */
    sessionData: session.data?.session ?? null,

    /**
     * Loading state
     * true while session is being fetched
     */
    isLoading: session.isPending,

    /**
     * Authentication status (convenience boolean)
     * true if session exists and is valid
     */
    isAuthenticated: !!session.data,

    /**
     * Error object (if session fetch failed)
     */
    error: session.error,

    /**
     * Refetch session from server
     * Useful after profile updates or permission changes
     *
     * @param disableCookieCache - Force database check (bypass 5min cookie cache)
     */
    refetch: async (disableCookieCache = false) => {
      if (disableCookieCache) {
        // Force database validation (bypass cookie cache)
        await authClient.getSession({ query: { disableCookieCache: true } });
      }
      return session.refetch();
    },

    /**
     * Sign out current user
     * Clears session and redirects to login
     */
    signOut: async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Redirect to login after successful sign out
            window.location.href = '/login';
          },
        },
      });
    },
  };
}

/**
 * Export Better-Auth client for direct access to all methods
 *
 * Use this when you need:
 * - Sign in/up methods: authClient.signIn.email(), authClient.signUp.email()
 * - Social auth: authClient.signIn.social({ provider: 'google' })
 * - Advanced session methods: authClient.getSession()
 */
export { authClient } from '@/lib/auth-client';
