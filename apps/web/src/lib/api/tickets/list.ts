/**
 * List tickets API operation
 * Handles fetching paginated list of tickets with filtering
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';

import type { ListTicketsParams, PaginatedTicketsResponse } from './types';

/**
 * List tickets with pagination and filtering
 * Protected: Requires authentication and internal team member status
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of tickets with related data
 * @throws Error if API request fails
 */
export async function listTickets(
  params: ListTicketsParams = {}
): Promise<PaginatedTicketsResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/tickets', params as Record<string, unknown>);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: authHeaders,
      cache: 'no-store',
    });
  } catch (fetchError) {
    // Network error - couldn't connect to API
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Network error';
    throw new Error(`Failed to connect to API: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = (await response.json()) as { error?: string; message?: string };
      errorMessage =
        errorData.error ?? errorData.message ?? `Request failed (${String(response.status)})`;
    } catch {
      errorMessage = `Request failed (${String(response.status)})`;
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as PaginatedTicketsResponse;
}
