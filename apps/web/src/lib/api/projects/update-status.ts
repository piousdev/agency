/**
 * Update project status API operations
 * Handles updating project status and completion percentage
 */

import { getAuthHeaders } from './api-utils';

import type {
  ProjectResponse,
  UpdateProjectCompletionInput,
  UpdateProjectDeliveryInput,
  UpdateProjectStatusInput,
} from './types';

/**
 * Update a project's status
 * Protected: Requires authentication and internal team member status
 *
 * @param projectId - ID of the project to update
 * @param data - Status update data
 * @returns Result object with success status and updated project or error message
 */
export async function updateProjectStatus(
  projectId: string,
  data: UpdateProjectStatusInput
): Promise<{ success: true; data: ProjectResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects/${projectId}/status`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as { message?: string; data?: ProjectResponse['data'] };

    if (!response.ok) {
      return { success: false, error: result.message ?? 'Failed to update project status' };
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
 * Update a project's completion percentage
 * Protected: Requires authentication and internal team member status
 *
 * @param projectId - ID of the project to update
 * @param data - Completion percentage (0-100)
 * @returns Result object with success status and updated project or error message
 */
export async function updateProjectCompletion(
  projectId: string,
  data: UpdateProjectCompletionInput
): Promise<{ success: true; data: ProjectResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects/${projectId}/completion`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as { message?: string; data?: ProjectResponse['data'] };

    if (!response.ok) {
      return { success: false, error: result.message ?? 'Failed to update project completion' };
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
 * Update a project's delivery date
 * Protected: Requires authentication and internal team member status
 *
 * @param projectId - ID of the project to update
 * @param data - Delivery date (ISO string or null to clear)
 * @returns Result object with success status and updated project or error message
 */
export async function updateProjectDelivery(
  projectId: string,
  data: UpdateProjectDeliveryInput
): Promise<{ success: true; data: ProjectResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects/${projectId}/delivery`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as { message?: string; data?: ProjectResponse['data'] };

    if (!response.ok) {
      return { success: false, error: result.message ?? 'Failed to update project delivery date' };
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
