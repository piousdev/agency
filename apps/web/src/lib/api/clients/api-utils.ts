/**
 * Helper utilities for client API client
 * Shared functions used across client-related API operations
 */

import { headers } from 'next/headers';

/**
 * Get authentication headers for API calls
 * Includes cookie from Next.js server-side request
 *
 * @returns Headers with authentication cookie
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headersList = await headers();
  return {
    'Content-Type': 'application/json',
    cookie: headersList.get('cookie'),
  };
}
