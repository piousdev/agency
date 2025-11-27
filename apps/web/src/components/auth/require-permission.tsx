/**
 * RequirePermission Component - Client-Side UI Guard
 *
 * ⚠️  SECURITY WARNING: This is a UI helper ONLY.
 * Real authorization MUST happen server-side in:
 * - Server Components: requirePermission()
 * - Server Actions: requirePermission()
 *
 * Purpose: Conditionally render UI elements based on user permissions.
 * Use for showing/hiding features based on fine-grained permissions.
 * DO NOT use as the only authorization check for protected functionality.
 *
 * ⚠️  IMPLEMENTATION NOTE:
 * Requires server-side session extension to include user permissions.
 * TODO: Extend Better-Auth session with customSession plugin to add permissions.
 *
 * Server-First Pattern:
 * 1. Server Components/Actions: requirePermission() (REAL security)
 * 2. This component: UI convenience (NOT security)
 */

'use client';

import { useAuth } from '@/lib/hooks/use-auth';

import type { ReactNode } from 'react';

interface UserWithPermissions {
  permissions?: string[];
}

interface RequirePermissionProps {
  /**
   * Required permission(s)
   * Can be a single permission or array of permissions
   *
   * Permission format examples:
   * - "projects:view" - View projects
   * - "projects:edit" - Edit projects
   * - "users:manage" - Manage users
   * - "reports:export" - Export reports
   */
  permission: string | string[];

  /**
   * Match strategy when multiple permissions provided
   * - "any": User needs ANY of the permissions (OR logic)
   * - "all": User needs ALL permissions (AND logic)
   */
  match?: 'any' | 'all';

  /**
   * Content to render if user has the required permission(s)
   */
  children: ReactNode;

  /**
   * Optional fallback content if user doesn't have permission(s)
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
 * RequirePermission Component
 *
 * Conditionally renders children based on user permissions.
 *
 * @example
 * ```tsx
 * // Show export button only if user has export permission
 * <RequirePermission permission="reports:export">
 *   <Button>Export Report</Button>
 * </RequirePermission>
 *
 * // Require multiple permissions (user needs ANY of them)
 * <RequirePermission
 *   permission={["projects:edit", "projects:admin"]}
 *   match="any"
 * >
 *   <EditProjectButton />
 * </RequirePermission>
 *
 * // Require multiple permissions (user needs ALL of them)
 * <RequirePermission
 *   permission={["users:view", "users:manage"]}
 *   match="all"
 *   fallback={<p>Insufficient permissions</p>}
 * >
 *   <UserManagementPanel />
 * </RequirePermission>
 * ```
 *
 * ⚠️  Remember: Always validate authorization server-side!
 * This component only controls UI visibility, not access.
 */
export function RequirePermission({
  permission,
  match = 'any',
  children,
  fallback = null,
  loadingFallback = null,
}: RequirePermissionProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return loadingFallback;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // TODO: Implement permission check once session is extended
  // Currently, the Better-Auth session doesn't include permissions
  // This requires:
  // 1. Server-side: Extend session with customSession plugin in apps/api/src/lib/auth.ts
  // 2. Query user's roles and aggregate permissions from role_assignment + role tables
  // 3. Include permissions array in session data
  // 4. Add customSessionClient plugin in apps/web/src/lib/auth-client.ts
  //
  // Placeholder implementation:
  const userPermissions = (user as UserWithPermissions).permissions;

  if (!userPermissions || userPermissions.length === 0) {
    console.warn(
      'RequirePermission: permissions not found in session. ' +
        'Session needs to be extended server-side with customSession plugin.'
    );
    return fallback;
  }

  // Check if user has required permission(s)
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess =
    match === 'all'
      ? requiredPermissions.every((perm) => userPermissions.includes(perm))
      : requiredPermissions.some((perm) => userPermissions.includes(perm));

  if (!hasAccess) {
    return fallback;
  }

  return children;
}
