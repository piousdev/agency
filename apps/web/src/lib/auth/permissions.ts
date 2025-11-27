import {
  getUserPermissions,
  checkUserPermission,
  checkUserPermissions,
  checkUserHasAnyPermission,
} from './permission-checks';
import { Permissions, DefaultRolePermissions, type Permission } from './permissions-constants';
import { requireUser, type SessionUser } from './session';

// Re-export constants from the shared file for backward compatibility
export { Permissions, DefaultRolePermissions, type Permission };

// Re-export permission check functions for backward compatibility
export { getUserPermissions, checkUserPermission, checkUserPermissions, checkUserHasAnyPermission };

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
    super(message ?? `Permission denied: ${permission}`);
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
