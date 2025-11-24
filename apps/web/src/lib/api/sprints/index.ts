/**
 * Sprints API client
 * Centralized exports for all sprint-related API operations
 */

import { cookies } from 'next/headers';
import type {
  Sprint,
  SprintWithProject,
  SprintsListResponse,
  SprintResponse,
  CreateSprintInput,
  UpdateSprintInput,
} from './types';

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get('better-auth.session_token')?.value ||
    cookieStore.get('__Secure-better-auth.session_token')?.value;

  return {
    'Content-Type': 'application/json',
    Cookie: sessionToken ? `better-auth.session_token=${sessionToken}` : '',
  };
}

/**
 * List sprints for a project or all sprints
 */
export async function listSprints(
  projectId?: string,
  options?: { status?: string; sort?: string }
): Promise<SprintsListResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  if (options?.status) params.set('status', options.status);
  if (options?.sort) params.set('sort', options.sort);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/sprints?${params.toString()}`,
    {
      headers: authHeaders,
      cache: 'no-store',
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, data: [], message: result.message || 'Failed to list sprints' };
  }

  return result;
}

/**
 * List all sprints across all projects
 */
export async function listAllSprints(options?: {
  status?: string;
  sort?: string;
}): Promise<SprintsListResponse> {
  return listSprints(undefined, options);
}

/**
 * Get a single sprint
 */
export async function getSprint(id: string): Promise<SprintResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sprints/${id}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to get sprint');
  }

  return result;
}

/**
 * Create a new sprint
 */
export async function createSprint(
  data: CreateSprintInput
): Promise<{ success: boolean; data?: Sprint; message?: string }> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sprints`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Failed to create sprint' };
  }

  return result;
}

/**
 * Update a sprint
 */
export async function updateSprint(
  id: string,
  data: UpdateSprintInput
): Promise<{ success: boolean; data?: Sprint; message?: string }> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sprints/${id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Failed to update sprint' };
  }

  return result;
}

/**
 * Delete a sprint
 */
export async function deleteSprint(id: string): Promise<{ success: boolean; message?: string }> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sprints/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Failed to delete sprint' };
  }

  return result;
}

export type { Sprint, SprintWithProject, SprintsListResponse, SprintResponse };
