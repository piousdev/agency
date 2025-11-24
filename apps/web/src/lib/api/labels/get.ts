/**
 * Get label API operation
 */

import { cookies } from 'next/headers';
import type { LabelResponse } from './types';

/**
 * Get a label by ID
 * Protected: Requires authentication and internal team member status
 *
 * @param labelId - The label ID
 * @returns Label data
 */
export async function getLabel(labelId: string): Promise<LabelResponse> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${labelId}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get label' }));
    throw new Error(error.message || 'Failed to get label');
  }

  return response.json();
}
