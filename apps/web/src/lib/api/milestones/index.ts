/**
 * Milestones API client
 * Centralized exports for all milestone-related API operations
 */

import { cookies } from 'next/headers';

import type {
  Milestone,
  MilestoneWithProject,
  MilestonesListResponse,
  MilestoneResponse,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from './types';

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get('better-auth.session_token')?.value ??
    cookieStore.get('__Secure-better-auth.session_token')?.value;

  return {
    'Content-Type': 'application/json',
    Cookie: sessionToken ? `better-auth.session_token=${sessionToken}` : '',
  };
}

/**
 * List milestones for a project
 */
export async function listMilestones(
  projectId: string,
  options?: { status?: string; sort?: string }
): Promise<MilestonesListResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams({ projectId });
  if (options?.status) params.set('status', options.status);
  if (options?.sort) params.set('sort', options.sort);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/milestones?${params.toString()}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = (await response.json()) as MilestonesListResponse & { message: string };

  if (!response.ok) {
    return { success: false, data: [], message: result.message };
  }

  return result as MilestonesListResponse;
}

/**
 * Get a single milestone
 */
export async function getMilestone(id: string): Promise<MilestoneResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/milestones/${id}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = (await response.json()) as MilestoneResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as MilestoneResponse;
}

/**
 * Create a new milestone
 */
export async function createMilestone(
  data: CreateMilestoneInput
): Promise<{ success: boolean; data?: Milestone; message?: string }> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/milestones`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = (await response.json()) as { success: boolean; data?: Milestone; message: string };

  if (!response.ok) {
    return { success: false, message: result.message };
  }

  return result;
}

/**
 * Update a milestone
 */
export async function updateMilestone(
  id: string,
  data: UpdateMilestoneInput
): Promise<{ success: boolean; data?: Milestone; message?: string }> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/milestones/${id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = (await response.json()) as { success: boolean; data?: Milestone; message: string };

  if (!response.ok) {
    return { success: false, message: result.message };
  }

  return result;
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id: string): Promise<{ success: boolean; message?: string }> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/milestones/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = (await response.json()) as { success: boolean; message: string };

  if (!response.ok) {
    return { success: false, message: result.message };
  }

  return result;
}

export type { Milestone, MilestoneWithProject, MilestonesListResponse, MilestoneResponse };
