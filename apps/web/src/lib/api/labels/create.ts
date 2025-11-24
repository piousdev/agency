/**
 * Create label API operation
 */

import { getAuthHeaders } from './api-utils';
import type { CreateLabelInput } from '@/lib/schemas/label';
import type { LabelResponse } from './types';

/**
 * Create a new label
 * Protected: Requires authentication and internal team member status
 *
 * @param data - Label data to create
 * @returns Created label data
 */
export async function createLabel(data: CreateLabelInput): Promise<LabelResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create label');
  }

  return result;
}
