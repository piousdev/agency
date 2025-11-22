/**
 * Update user capacity API operation
 * Handles updating team member capacity percentage
 */

import { getAuthHeaders } from './api-utils';
import type { UpdateCapacityInput, UserResponse } from './types';

/**
 * Update a user's capacity percentage
 * Protected: Requires authentication and internal team member status
 *
 * @param userId - ID of the user to update
 * @param data - Capacity percentage (0-200%)
 * @returns Result object with success status and updated user or error message
 */
export async function updateCapacity(
  userId: string,
  data: UpdateCapacityInput
): Promise<{ success: true; data: UserResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/capacity`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Failed to update user capacity' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}
