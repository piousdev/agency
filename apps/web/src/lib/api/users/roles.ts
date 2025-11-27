/**
 * Role management API operations
 * Handles role assignment, removal, and listing available roles
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';

import type {
  ApiResponse,
  AssignRoleInput,
  ListRolesParams,
  PaginatedRolesResponse,
} from './types';

/**
 * Assign a role to a user
 *
 * @param userId - The user's unique identifier
 * @param data - Role assignment data
 * @returns Success message
 * @throws Error if API request fails or role already assigned
 */
export async function assignRole(userId: string, data: AssignRoleInput): Promise<ApiResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${String(process.env.NEXT_PUBLIC_API_URL)}/api/users/${userId}/assign-role`,
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? 'Failed to assign role');
  }

  return (await response.json()) as PaginatedRolesResponse;
}

/**
 * Remove a role from a user
 *
 * @param userId - The user's unique identifier
 * @param roleId - The role's unique identifier
 * @returns Success message
 * @throws Error if API request fails or role not found
 */
export async function removeRole(userId: string, roleId: string): Promise<ApiResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${String(process.env.NEXT_PUBLIC_API_URL)}/api/users/${userId}/roles/${roleId}`,
    {
      method: 'DELETE',
      headers: authHeaders,
    }
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? 'Failed to remove role');
  }

  return (await response.json()) as PaginatedRolesResponse;
}

/**
 * List all available roles
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of roles
 * @throws Error if API request fails
 */
export async function listRoles(params: ListRolesParams = {}): Promise<PaginatedRolesResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/roles', params as Record<string, unknown>);

  const response = await fetch(url, {
    headers: authHeaders,
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? 'Failed to fetch roles');
  }

  return (await response.json()) as PaginatedRolesResponse;
}
