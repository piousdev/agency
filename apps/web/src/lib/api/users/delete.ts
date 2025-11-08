/**
 * Delete user API operation
 * Handles permanent deletion of a user account
 */

import { getAuthHeaders } from './api-utils';
import type { ApiResponse } from './types';

/**
 * Delete a user permanently
 *
 * @param userId - The user's unique identifier
 * @returns Success message
 * @throws Error if API request fails or user cannot be deleted
 */
export async function deleteUser(userId: string): Promise<ApiResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }

  return response.json();
}
