import { cache } from 'react';

import { serverFetch } from '../api-client';

import type { Permission } from './permissions-constants';

/**
 * Fetch user permissions from the API
 * Cached per request to avoid multiple database calls
 */
export const getUserPermissions = cache(async (userId: string): Promise<Permission[]> => {
  try {
    const response = await serverFetch(`/api/users/${userId}/permissions`);

    if (!response.ok) {
      console.error(
        `Failed to fetch permissions: ${String(response.status)} ${response.statusText}`
      );
      return [];
    }

    const data = (await response.json()) as { permissions?: Permission[] };
    return data.permissions ?? [];
  } catch (error) {
    console.error('Failed to get user permissions:', error);
    return [];
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
