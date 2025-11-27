/**
 * Update label API operation
 */

import { getAuthHeaders } from './api-utils';

import type { LabelResponse } from './types';
import type { UpdateLabelInput } from '@/lib/schemas/label';

/**
 * Update an existing label
 * Protected: Requires authentication and internal team member status
 *
 * @param labelId - The label ID to update
 * @param data - Label data to update
 * @returns Updated label data
 */
export async function updateLabel(labelId: string, data: UpdateLabelInput): Promise<LabelResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels/${labelId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = (await response.json()) as LabelResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as LabelResponse;
}
