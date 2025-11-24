/**
 * Update label API operation
 */

import { getAuthHeaders } from './api-utils';
import type { UpdateLabelInput } from '@/lib/schemas/label';
import type { LabelResponse } from './types';

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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${labelId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update label');
  }

  return result;
}
