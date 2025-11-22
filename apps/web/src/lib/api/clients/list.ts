/**
 * List clients API operation
 */

import { cookies } from 'next/headers';
import type { ClientsListResponse } from './types';

/**
 * List all clients
 * Protected: Requires authentication and internal team member status
 *
 * @param activeOnly - Whether to only return active clients (default: true)
 * @returns List of clients
 */
export async function listClients(activeOnly = true): Promise<ClientsListResponse> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`);
  if (!activeOnly) {
    url.searchParams.set('active', 'false');
  }

  const response = await fetch(url.toString(), {
    headers: {
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to list clients' }));
    throw new Error(error.message || 'Failed to list clients');
  }

  return response.json();
}
