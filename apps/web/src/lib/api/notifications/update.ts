/**
 * Update notifications API operations
 * Handles marking notifications as read/unread and deleting notifications
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';
import type {
  MarkNotificationReadParams,
  MarkAllNotificationsReadParams,
  NotificationUpdateResponse,
  NotificationDeleteResponse,
} from './types';

/**
 * Mark a single notification as read/unread
 * Protected: Requires authentication
 *
 * @param id - Notification ID
 * @param params - Read status to set
 * @returns Updated notification
 * @throws Error if API request fails
 */
export async function markNotificationRead(
  id: string,
  params: MarkNotificationReadParams
): Promise<NotificationUpdateResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl(`/api/notifications/${id}/read`);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(params),
    });
  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Network error';
    throw new Error(`Failed to connect to API: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || `Request failed (${response.status})`;
    } catch {
      errorMessage = `Request failed (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Mark all (or specific) notifications as read
 * Protected: Requires authentication
 *
 * @param params - Optional array of notification IDs to mark as read
 * @returns Update count
 * @throws Error if API request fails
 */
export async function markAllNotificationsRead(
  params: MarkAllNotificationsReadParams = {}
): Promise<NotificationUpdateResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl('/api/notifications/read-all');

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(params),
    });
  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Network error';
    throw new Error(`Failed to connect to API: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || `Request failed (${response.status})`;
    } catch {
      errorMessage = `Request failed (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete a notification
 * Protected: Requires authentication
 *
 * @param id - Notification ID to delete
 * @returns Success message
 * @throws Error if API request fails
 */
export async function deleteNotification(id: string): Promise<NotificationDeleteResponse> {
  const authHeaders = await getAuthHeaders();
  const url = buildApiUrl(`/api/notifications/${id}`);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders,
    });
  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Network error';
    throw new Error(`Failed to connect to API: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || `Request failed (${response.status})`;
    } catch {
      errorMessage = `Request failed (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
