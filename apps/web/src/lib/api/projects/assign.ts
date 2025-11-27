/**
 * Project assignment API operations
 * Handles assigning and removing team members from projects
 */

import { getAuthHeaders } from './api-utils';

import type { AssignProjectInput, ProjectResponse, RemoveProjectAssignmentInput } from './types';

/**
 * Assign team members to a project
 * Protected: Requires authentication and internal team member status
 * Note: Preserves existing assignments and adds new ones
 *
 * @param projectId - ID of the project
 * @param data - Array of user IDs to assign
 * @returns Result object with success status and updated project or error message
 */
export async function assignProject(
  projectId: string,
  data: AssignProjectInput
): Promise<{ success: true; data: ProjectResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects/${projectId}/assign`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as { message?: string; data?: ProjectResponse['data'] };

    if (!response.ok) {
      return { success: false, error: result.message ?? 'Failed to assign project' };
    }

    if (!result.data) {
      return { success: false, error: 'No data returned from server' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Remove a team member from a project
 * Protected: Requires authentication and internal team member status
 *
 * @param projectId - ID of the project
 * @param data - User ID to remove from project
 * @returns Updated project without the removed team member
 * @throws Error if API request fails or project not found
 */
export async function removeProjectAssignment(
  projectId: string,
  data: RemoveProjectAssignmentInput
): Promise<ProjectResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects/${projectId}/assign`,
    {
      method: 'DELETE',
      headers: authHeaders,
      body: JSON.stringify(data),
    }
  );

  const result = (await response.json()) as { message?: string } & Partial<ProjectResponse>;

  if (!response.ok) {
    throw new Error(result.message ?? 'Failed to remove project assignment');
  }

  return result as ProjectResponse;
}
