/**
 * List projects API operation
 * Handles fetching paginated list of projects with filtering
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';
import type { ListProjectsParams, PaginatedProjectsResponse } from './types';

/**
 * List projects with pagination and filtering
 * Protected: Requires authentication and internal team member status
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of projects with related data
 * @throws Error if API request fails
 */
export async function listProjects(
  params: ListProjectsParams = {}
): Promise<PaginatedProjectsResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/projects', params as Record<string, unknown>);

  const response = await fetch(url, {
    headers: authHeaders,
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch projects');
  }

  return response.json();
}
