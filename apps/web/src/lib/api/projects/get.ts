/**
 * Get project API operation
 * Handles fetching a single project by ID
 */

import { getAuthHeaders } from './api-utils';

import type { ProjectDetailResponse } from './types';

/**
 * Get a single project by ID
 * Protected: Requires authentication and internal team member status
 *
 * @param projectId - ID of the project to fetch
 * @returns Project with related data including extended fields
 * @throws Error if API request fails or project not found
 */
export async function getProject(projectId: string): Promise<ProjectDetailResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects/${projectId}`,
    {
      headers: authHeaders,
      cache: 'no-store',
    }
  );

  const result = (await response.json()) as { message?: string } & Partial<ProjectDetailResponse>;

  if (!response.ok) {
    throw new Error(result.message ?? 'Failed to fetch project');
  }

  return result as ProjectDetailResponse;
}
