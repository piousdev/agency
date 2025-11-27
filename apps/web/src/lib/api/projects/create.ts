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

  const headersObject =
    authHeaders instanceof Headers
      ? (Object.fromEntries(authHeaders.entries()) as Record<string, string>)
      : (authHeaders as Record<string, string>);

  const response = await fetch(`${String(process.env.NEXT_PUBLIC_API_URL)}/api/projects`, {
    method: 'POST',
    headers: {
      ...headersObject,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = (await response.json()) as { message?: string } & Partial<ProjectResponse>;

  if (!response.ok) {
    throw new Error(result.message ?? 'Failed to create project');
  }

  return result as ProjectResponse;
}
