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
    cookie: headersList.get('cookie'),
  };
}

/**
 * Build API URL
 */
export function buildApiUrl(path: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
  return `${apiUrl}/api/dashboard-preferences${path}`;
}
