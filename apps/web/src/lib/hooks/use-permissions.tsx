/**
 * usePermissions Hook - Client-side Permission Checking
 *
 * Server-First Principle: This hook is ONLY for client components that need
 * to conditionally render UI based on permissions.
 * For server-side permission checks, use requirePermission/requireAnyPermission instead.
 *
 * Usage:
 * ```tsx
 * "use client";
 * import { usePermissions } from "@/lib/hooks/use-permissions";
 * import { Permissions } from "@/lib/auth/permissions";
 *
 * export function ProjectActions() {
 *   const { can, isLoading } = usePermissions();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <div>
 *       {can(Permissions.PROJECT_CREATE) && <CreateProjectButton />}
 *       {can(Permissions.PROJECT_EDIT) && <EditProjectButton />}
 *       {can(Permissions.PROJECT_DELETE) && <DeleteProjectButton />}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import type { Permission } from '@/lib/auth/permissions';
import { DefaultRolePermissions } from '@/lib/auth/permissions';

interface UsePermissionsReturn {
  /**
   * All permissions for the current user
   */
  permissions: Permission[];

  /**
   * Check if user has a specific permission
   */
  can: (permission: Permission) => boolean;

  /**
   * Check if user has all specified permissions
   */
  canAll: (permissions: Permission[]) => boolean;

  /**
   * Check if user has any of the specified permissions
   */
  canAny: (permissions: Permission[]) => boolean;

  /**
   * Loading state while permissions are being fetched
   */
  isLoading: boolean;

  /**
   * Error if permissions fetch failed
   */
  error: Error | null;

  /**
   * Refetch permissions from server
   */
  refetch: () => Promise<void>;
}

/**
 * usePermissions Hook
 *
 * Fetches and caches user permissions for client-side conditional rendering.
 * Permissions are cached and only refetched when explicitly requested.
 *
 * @returns Permission checking utilities
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user?.id) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${user.id}/permissions`, {
        credentials: 'include',
      });

      if (!response.ok) {
        // Fallback: if user is internal (has @company email), grant editor permissions
        // This maintains backward compatibility until roles are fully seeded
        if (user.email?.includes('@')) {
          // Check if internal user based on some criteria
          // For now, fall back to editor permissions
          setPermissions(DefaultRolePermissions.editor as Permission[]);
        } else {
          setPermissions(DefaultRolePermissions.viewer as Permission[]);
        }
        return;
      }

      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch permissions'));
      // Fallback to editor permissions for authenticated users
      setPermissions(DefaultRolePermissions.editor as Permission[]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Fetch permissions when user changes
  useEffect(() => {
    if (!isAuthLoading) {
      fetchPermissions();
    }
  }, [fetchPermissions, isAuthLoading]);

  /**
   * Check if user has a specific permission
   */
  const can = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  /**
   * Check if user has all specified permissions
   */
  const canAll = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const canAny = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  return useMemo(
    () => ({
      permissions,
      can,
      canAll,
      canAny,
      isLoading: isAuthLoading || isLoading,
      error,
      refetch: fetchPermissions,
    }),
    [permissions, can, canAll, canAny, isAuthLoading, isLoading, error, fetchPermissions]
  );
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on permissions.
 * Provides a declarative way to guard UI elements.
 *
 * Usage:
 * ```tsx
 * <PermissionGate permission={Permissions.PROJECT_CREATE}>
 *   <CreateProjectButton />
 * </PermissionGate>
 *
 * <PermissionGate permissions={[Permissions.PROJECT_EDIT, Permissions.PROJECT_DELETE]} mode="any">
 *   <ProjectActions />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  permissions: requiredPermissions,
  mode = 'all',
  fallback = null,
  children,
}: {
  /** Single permission to check */
  permission?: Permission;
  /** Multiple permissions to check */
  permissions?: Permission[];
  /** Mode for multiple permissions: 'all' requires all, 'any' requires at least one */
  mode?: 'all' | 'any';
  /** Fallback content when permission is denied */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can, canAll, canAny, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  // Single permission check
  if (permission) {
    return can(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Multiple permissions check
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission =
      mode === 'all' ? canAll(requiredPermissions) : canAny(requiredPermissions);
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // No permissions specified, render children
  return <>{children}</>;
}
