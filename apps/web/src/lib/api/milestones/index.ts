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
    cookieStore.get('better-auth.session_token')?.value ||
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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/milestones?${params.toString()}`,
    {
      headers: authHeaders,
      cache: 'no-store',
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, data: [], message: result.message || 'Failed to list milestones' };
  }

  return result;
}

/**
 * Get a single milestone
 */
export async function getMilestone(id: string): Promise<MilestoneResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/milestones/${id}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to get milestone');
  }

  return result;
}

/**
 * Create a new milestone
 */
export async function createMilestone(
  data: CreateMilestoneInput
): Promise<{ success: boolean; data?: Milestone; message?: string }> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/milestones`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Failed to create milestone' };
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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/milestones/${id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Failed to update milestone' };
  }

  return result;
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id: string): Promise<{ success: boolean; message?: string }> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/milestones/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Failed to delete milestone' };
  }

  return result;
}

export type { Milestone, MilestoneWithProject, MilestonesListResponse, MilestoneResponse };
