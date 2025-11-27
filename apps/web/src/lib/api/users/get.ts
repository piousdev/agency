/**
 * Get single user API operation
 * Handles fetching a single user by ID with their roles
 */

import { getAuthHeaders } from './api-utils';

import type { UserResponse } from './types';

/**
 * Get a single user by ID
 *
 * @param userId - The user's unique identifier
 * @returns User data with roles
 * @throws Error if API request fails or user not found
 */
export async function getUser(userId: string): Promise<UserResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${String(process.env.NEXT_PUBLIC_API_URL)}/api/users/${userId}`, {
    headers: authHeaders,
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? 'Failed to fetch user');
  }

  return (await response.json()) as UserResponse;
}
