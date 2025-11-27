/**
 * Helper utilities for project API client
 * Shared functions used across project-related API operations
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

/**
 * Build API URL with query parameters
 *
 * @param path - API endpoint path
 * @param params - Query parameters object
 * @returns Full URL with query string
 */
export function buildApiUrl(path: string, params?: Record<string, unknown>): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
  const url = `${apiUrl}${path}`;

  if (!params) {
    return url;
  }

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle different types properly
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        queryParams.append(key, String(value));
      } else {
        // Handle arrays and objects by serializing to JSON
        queryParams.append(key, JSON.stringify(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}
