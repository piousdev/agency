/**
 * RequireRole Component - Client-Side UI Guard
 *
 * ⚠️  SECURITY WARNING: This is a UI helper ONLY.
 * Real authorization MUST happen server-side in:
 * - Server Components: requireRole()
 * - Server Actions: requireRole()
 *
 * Purpose: Conditionally render UI elements based on user role.
 * Use for hiding/showing buttons, menus, or UI sections.
 * DO NOT use as the only authorization check for protected functionality.
 *
 * Server-First Pattern:
 * 1. Server Components/Actions: requireRole() (REAL security)
 * 2. This component: UI convenience (NOT security)
 */

'use client';

import { useAuth } from '@/lib/hooks/use-auth';

import type { ReactNode } from 'react';

interface RequireRoleProps {
  /**
   * Required role name
   * Currently supports: "internal" (team members)
   * Future: Custom roles from RBAC system
   */
  role: string;

  /**
   * Content to render if user has the required role
   */
  children: ReactNode;

  /**
   * Optional fallback content if user doesn't have role
   * If not provided, renders nothing
   */
  fallback?: ReactNode;

  /**
   * Optional loading state while checking authentication
   * If not provided, renders nothing during loading
   */
  loadingFallback?: ReactNode;
}

/**
 * RequireRole Component
 *
 * Conditionally renders children based on user role.
 *
 * @example
 * ```tsx
 * // Hide admin button from non-internal users
 * <RequireRole role="internal">
 *   <Button>Admin Settings</Button>
 * </RequireRole>
 *
 * // Show different content for different roles
 * <RequireRole
 *   role="internal"
 *   fallback={<p>You need admin access</p>}
 * >
 *   <AdminPanel />
 * </RequireRole>
 * ```
 *
 * ⚠️  Remember: Always validate authorization server-side!
 * This component only controls UI visibility, not access.
 */
export function RequireRole({
  role,
  children,
  fallback = null,
  loadingFallback = null,
}: RequireRoleProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return loadingFallback;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // Check role
  // TODO: Once RBAC is fully implemented, check user.roles array
  // For now, we only check isInternal flag
  const hasRole = role === 'internal' ? user.isInternal : false;

  if (!hasRole) {
    return fallback;
  }

  return children;
}
