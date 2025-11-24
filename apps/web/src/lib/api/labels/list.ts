/**
 * List labels API operation
 */

import { cookies } from 'next/headers';
import type { LabelScope } from '@/lib/schemas/label';
import type { LabelsListResponse } from './types';

/**
 * List all labels
 * Protected: Requires authentication and internal team member status
 *
 * @param scope - Optional filter by scope (global, project, ticket)
 * @returns List of labels
 */
export async function listLabels(scope?: LabelScope): Promise<LabelsListResponse> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/labels`);
  if (scope) {
    url.searchParams.set('scope', scope);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to list labels' }));
    throw new Error(error.message || 'Failed to list labels');
  }

  return response.json();
}
