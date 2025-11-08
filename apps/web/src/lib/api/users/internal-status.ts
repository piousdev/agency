/**
 * Update internal status API operation
 * Handles toggling user's internal team member status
 */

import { getAuthHeaders } from './api-utils';
import type { UpdateInternalStatusInput, UserResponse } from './types';

/**
 * Toggle user's internal team member status
 *
 * @param userId - The user's unique identifier
 * @param data - Internal status update data
 * @returns Updated user data
 * @throws Error if API request fails
 */
export async function updateInternalStatus(
  userId: string,
  data: UpdateInternalStatusInput
): Promise<UserResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/internal-status`,
    {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update internal status');
  }

  return response.json();
}
