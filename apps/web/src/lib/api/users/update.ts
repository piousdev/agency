/**
 * Update user API operation
 * Handles updating user details (name, email, role, etc.)
 */

import { getAuthHeaders } from './api-utils';

import type { UpdateUserInput, UserResponse } from './types';

/**
 * Update user details
 *
 * @param userId - The user's unique identifier
 * @param data - Updated user data
 * @returns Updated user data
 * @throws Error if API request fails or validation errors
 */
export async function updateUser(userId: string, data: UpdateUserInput): Promise<UserResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${String(process.env.NEXT_PUBLIC_API_URL)}/api/users/${userId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? 'Failed to update user');
  }

  return (await response.json()) as UserResponse;
}
