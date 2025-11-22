/**
 * Update project API operation
 * Handles updating an existing project
 */

import { getAuthHeaders } from './api-utils';
import type { ProjectResponse, UpdateProjectInput } from './types';

/**
 * Update an existing project
 * Protected: Requires authentication and internal team member status
 *
 * @param projectId - ID of the project to update
 * @param data - Project data to update
 * @returns Updated project with related data
 * @throws Error if API request fails or project not found
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectInput
): Promise<ProjectResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update project');
  }

  return result;
}
