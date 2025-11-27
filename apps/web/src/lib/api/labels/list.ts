/**
 * List labels API operation
 */

import { cookies } from 'next/headers';

import type { LabelsListResponse } from './types';
import type { LabelScope } from '@/lib/schemas/label';

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const url = new URL(`${apiUrl}/api/labels`);
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
    const error = (await response.json().catch(() => ({
      message: 'Failed to list labels',
    }))) as { message: string };
    throw new Error(error.message);
  }

  return response.json() as Promise<LabelsListResponse>;
}
