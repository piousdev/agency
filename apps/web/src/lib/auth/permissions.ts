import { headers } from 'next/headers';
import { cache } from 'react';
import { requireUser, type SessionUser } from './session';
import { Permissions, DefaultRolePermissions, type Permission } from './permissions-constants';

// Re-export constants from the shared file for backward compatibility
export { Permissions, DefaultRolePermissions, type Permission };

/**
 * Fetch user permissions from the API
 * Cached per request to avoid multiple database calls
 */
export const getUserPermissions = cache(async (userId: string): Promise<Permission[]> => {
  try {
    const headersList = await headers();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/permissions`,
      {
        headers: {
          cookie: headersList.get('cookie') || '',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      // Fallback: if user is internal, grant editor permissions
      // This maintains backward compatibility until roles are fully seeded
      return DefaultRolePermissions.editor;
    }

    const data = await response.json();
    return data.permissions || [];
  } catch (error) {
    console.error('Failed to get user permissions:', error);
    // Fallback to editor permissions for internal users
    return DefaultRolePermissions.editor;
  }
});

/**
 * Check if a user has a specific permission
 */
export async function checkUserPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

/**
 * Check if a user has all of the specified permissions
 */
export async function checkUserPermissions(
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return requiredPermissions.every((p) => permissions.includes(p));
}

/**
 * Check if a user has any of the specified permissions
 */
export async function checkUserHasAnyPermission(
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return requiredPermissions.some((p) => permissions.includes(p));
}

/**
 * Server Action wrapper that requires a specific permission
 * Use this in Server Actions to enforce permission checks
 *
 * @example
 * ```ts
 * export async function createProjectAction(data: CreateProjectInput) {
 *   const user = await requirePermission(Permissions.PROJECT_CREATE);
 *   // ... create project
 * }
 * ```
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();

  // Temporary: internal users get full access until RBAC is fully implemented
  // TODO: Remove this fallback once roles are seeded
  if (user.isInternal) {
    return user;
  }

  const hasPermission = await checkUserPermission(user.id, permission);

  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return user;
}

/**
 * Server Action wrapper that requires any of the specified permissions
 */
export async function requireAnyPermission(permissions: Permission[]): Promise<SessionUser> {
  const user = await requireUser();

  // Temporary: internal users get full access
  if (user.isInternal) {
    return user;
  }

  const hasPermission = await checkUserHasAnyPermission(user.id, permissions);

  if (!hasPermission) {
    throw new Error(`Permission denied: requires one of ${permissions.join(', ')}`);
  }

  return user;
}

/**
 * Server Action wrapper that requires all of the specified permissions
 */
export async function requireAllPermissions(permissions: Permission[]): Promise<SessionUser> {
  const user = await requireUser();

  // Temporary: internal users get full access
  if (user.isInternal) {
    return user;
  }

  const hasPermissions = await checkUserPermissions(user.id, permissions);

  if (!hasPermissions) {
    throw new Error(`Permission denied: requires all of ${permissions.join(', ')}`);
  }

  return user;
}

/**
 * Permission error class for better error handling
 */
export class PermissionError extends Error {
  constructor(
    public permission: Permission,
    message?: string
  ) {
    super(message || `Permission denied: ${permission}`);
    this.name = 'PermissionError';
  }
}

/**
 * Check if an error is a permission error
 */
export function isPermissionError(error: unknown): error is PermissionError {
  return (
    error instanceof PermissionError ||
    (error instanceof Error && error.message.startsWith('Permission denied:'))
  );
}
