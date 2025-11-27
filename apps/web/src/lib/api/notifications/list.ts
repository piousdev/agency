/**
 * List notifications API operation
 * Handles fetching paginated list of notifications with filtering
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';

import type {
  ListNotificationsParams,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
} from './types';

/**
 * List notifications with pagination and filtering
 * Protected: Requires authentication
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of notifications with related data
 * @throws Error if API request fails
 */
export async function listNotifications(
  params: ListNotificationsParams = {}
): Promise<PaginatedNotificationsResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/notifications', params as Record<string, unknown>);

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

  return response.json() as Promise<PaginatedNotificationsResponse>;
}

/**
 * Get unread notification count
 * Protected: Requires authentication
 *
 * @returns Unread notification count
 * @throws Error if API request fails
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/notifications/unread-count');

  let response: Response;
  try {
    response = await fetch(url, {
      headers: authHeaders,
      cache: 'no-store',
    });
  } catch (fetchError) {
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

  return response.json() as Promise<UnreadCountResponse>;
}
