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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/${labelId}`, {
    method: 'DELETE',
    headers: authHeaders,
    cache: 'no-store',
  });

  const result = (await response.json()) as DeleteLabelResponse;

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}
