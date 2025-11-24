/**
 * API utilities for labels
 */

import { cookies } from 'next/headers';

/**
 * Get auth headers for API requests
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  return {
    'Content-Type': 'application/json',
    Cookie: cookieHeader,
  };
}
