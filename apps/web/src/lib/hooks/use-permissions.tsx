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
import type { Permission } from '@/lib/auth/permissions-constants';
import { DefaultRolePermissions, Permissions } from '@/lib/auth/permissions-constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Re-export for convenience in client components
export { Permissions, type Permission } from '@/lib/auth/permissions-constants';

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
 * Permission label mapping for user-friendly messages
 */
const PermissionLabels: Record<string, string> = {
  'ticket:create': 'create tickets',
  'ticket:edit': 'edit tickets',
  'ticket:delete': 'delete tickets',
  'ticket:assign': 'assign tickets',
  'ticket:view': 'view tickets',
  'project:create': 'create projects',
  'project:edit': 'edit projects',
  'project:delete': 'delete projects',
  'project:assign': 'assign projects',
  'project:view': 'view projects',
  'client:create': 'create clients',
  'client:edit': 'edit clients',
  'client:delete': 'delete clients',
  'client:view': 'view clients',
  'bulk:operations': 'perform bulk operations',
  'admin:users': 'manage users',
  'admin:roles': 'manage roles',
};

/**
 * Get a user-friendly label for a permission
 */
function getPermissionLabel(permission: Permission): string {
  return PermissionLabels[permission] || permission;
}

interface PermissionGateProps {
  /** Single permission to check */
  permission?: Permission;
  /** Multiple permissions to check */
  permissions?: Permission[];
  /** Mode for multiple permissions: 'all' requires all, 'any' requires at least one */
  mode?: 'all' | 'any';
  /** Fallback content when permission is denied (for 'hide' behavior) */
  fallback?: React.ReactNode;
  /**
   * Behavior when permission is denied:
   * - 'hide': Hide the content entirely (show fallback if provided)
   * - 'disable': Show content in disabled state with tooltip
   */
  behavior?: 'hide' | 'disable';
  /** Custom tooltip message when disabled (overrides default) */
  disabledTooltip?: string;
  children: React.ReactNode;
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on permissions.
 * Provides a declarative way to guard UI elements.
 *
 * Usage:
 * ```tsx
 * // Hide content when permission is missing
 * <PermissionGate permission={Permissions.PROJECT_CREATE}>
 *   <CreateProjectButton />
 * </PermissionGate>
 *
 * // Show disabled state with tooltip when permission is missing
 * <PermissionGate permission={Permissions.PROJECT_CREATE} behavior="disable">
 *   <Button>Create Project</Button>
 * </PermissionGate>
 *
 * // Multiple permissions with 'any' mode
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
  behavior = 'hide',
  disabledTooltip,
  children,
}: PermissionGateProps) {
  const { can, canAll, canAny, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  // Determine if user has permission
  let hasPermission = true;

  if (permission) {
    hasPermission = can(permission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    hasPermission = mode === 'all' ? canAll(requiredPermissions) : canAny(requiredPermissions);
  }

  // User has permission - render normally
  if (hasPermission) {
    return <>{children}</>;
  }

  // User lacks permission - handle based on behavior
  if (behavior === 'hide') {
    return <>{fallback}</>;
  }

  // 'disable' behavior - wrap children in disabled state with tooltip
  const tooltipMessage =
    disabledTooltip ||
    (permission
      ? `You don't have permission to ${getPermissionLabel(permission)}`
      : requiredPermissions && requiredPermissions.length > 0
        ? `You need permission to ${requiredPermissions.map(getPermissionLabel).join(mode === 'all' ? ' and ' : ' or ')}`
        : 'Permission denied');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-not-allowed">
            <span className="pointer-events-none opacity-50">{children}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
