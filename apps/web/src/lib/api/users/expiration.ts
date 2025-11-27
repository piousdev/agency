/**
 * Extend expiration API operation
 * Handles updating or extending user's account expiration date
 */

import { getAuthHeaders } from './api-utils';

import type { ExtendExpirationInput, UserResponse } from './types';

/**
 * Extend or update user's expiration date
 *
 * @param userId - The user's unique identifier
 * @param data - Expiration date update data
 * @returns Updated user data
 * @throws Error if API request fails or invalid date
 */
export async function extendExpiration(
  userId: string,
  data: ExtendExpirationInput
): Promise<UserResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${String(process.env.NEXT_PUBLIC_API_URL)}/api/users/${userId}/extend-expiration`,
    {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message ?? 'Failed to extend expiration');
  }

  return (await response.json()) as UserResponse;
}
