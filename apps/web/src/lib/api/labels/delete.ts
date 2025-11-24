/**
 * Delete label API operation
 */

import { getAuthHeaders } from './api-utils';

interface DeleteLabelResponse {
  success: boolean;
  message: string;
}

/**
 * Delete a label
 * Protected: Requires authentication and internal team member status
 *
 * @param labelId - The label ID to delete
 * @returns Success response
 */
export async function deleteLabel(labelId: string): Promise<DeleteLabelResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${labelId}`, {
    method: 'DELETE',
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete label');
  }

  return result;
}
