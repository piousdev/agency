/**
 * Create client API operation
 * Handles creating a new client
 */

import { getAuthHeaders } from './api-utils';

import type { Client } from './types';
import type { CreateClientInput } from '@/lib/schemas';

export interface CreateClientResponse {
  success: boolean;
  data: Client;
  message: string;
}

/**
 * Create a new client
 * Protected: Requires authentication and internal team member status
 *
 * @param data - Client data to create
 * @returns Created client data
 * @throws Error if API request fails
 */
export async function createClient(data: CreateClientInput): Promise<CreateClientResponse> {
  const authHeaders = await getAuthHeaders();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/clients`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = (await response.json()) as CreateClientResponse & { message: string };

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result as CreateClientResponse;
}
