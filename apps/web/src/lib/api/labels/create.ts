/**
 * Create label API operation
 */

import { getAuthHeaders } from './api-utils';

import type { LabelResponse } from './types';
import type { CreateLabelInput } from '@/lib/schemas/label';

/**
 * Create a new label
 * Protected: Requires authentication and internal team member status
 *
 * @param data - Label data to create
 * @returns Created label data
 */
export async function createLabel(data: CreateLabelInput): Promise<LabelResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/labels`, {
    method: 'POST',
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
