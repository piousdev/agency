/**
 * Create project API operation
 * Handles creating a new project
 */

import { getAuthHeaders } from './api-utils';
import type { CreateProjectInput, ProjectResponse } from './types';

/**
 * Create a new project
 * Protected: Requires authentication and internal team member status
 *
 * @param data - Project data to create
 * @returns Created project with related data
 * @throws Error if API request fails
 */
export async function createProject(data: CreateProjectInput): Promise<ProjectResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create project');
  }

  return result;
}
