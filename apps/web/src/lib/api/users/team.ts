/**
 * Team members API operation
 * Handles fetching internal team members with capacity and project data
 */

import { getAuthHeaders } from './api-utils';
import type { TeamMembersResponse } from './types';

/**
 * List all internal team members with capacity and active projects
 * Protected: Requires authentication and internal team member status
 *
 * @returns List of team members with capacity status and active projects
 * @throws Error if API request fails
 */
export async function listTeamMembers(): Promise<TeamMembersResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/team`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || `Request failed (${response.status})`;
    } catch {
      errorMessage = `Request failed (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
