/**
 * Client-safe API utilities
 * These functions can be used in both Server and Client Components
 * Uses credentials: 'include' for cookie-based auth instead of manual cookie forwarding
 */

/**
 * Build API URL with query parameters
 * Client-safe - can be used in any component
 *
 * @param path - API endpoint path
 * @param params - Query parameters object
 * @returns Full URL with query string
 */
export function buildApiUrl(path: string, params?: Record<string, unknown>): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  const url = `${baseUrl}${path}`;

  if (!params) {
    return url;
  }

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Client-safe fetch wrapper
 * Uses credentials: 'include' to send cookies automatically
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function clientFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
