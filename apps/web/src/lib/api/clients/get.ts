/**
 * Get single client API
 */

import { getAuthHeaders } from './api-utils';

import type { ClientResponse } from './types';

/**
 * Get a single client by ID with related data
 */
export async function getClient(id: string): Promise<ClientResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';
  const url = `${baseUrl}/api/clients/${id}`;
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch client: ${response.statusText}`);
  }

  return response.json() as Promise<ClientResponse>;
}
