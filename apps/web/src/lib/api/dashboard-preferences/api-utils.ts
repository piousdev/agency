/**
 * Helper utilities for dashboard preferences API client
 */

import { headers } from 'next/headers';

/**
 * Get authentication headers for API calls
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headersList = await headers();
  return {
    'Content-Type': 'application/json',
    cookie: headersList.get('cookie') || '',
  };
}

/**
 * Build API URL
 */
export function buildApiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-preferences${path}`;
}
