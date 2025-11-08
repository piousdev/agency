/**
 * List users API operation
 * Handles fetching paginated list of users with filtering and search
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';
import type { ListUsersParams, PaginatedUsersResponse } from './types';

/**
 * List users with pagination, filtering, and search
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of users
 * @throws Error if API request fails
 */
export async function listUsers(params: ListUsersParams = {}): Promise<PaginatedUsersResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/users', params as Record<string, unknown>);

  const response = await fetch(url, {
    headers: authHeaders,
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }

  return response.json();
}
