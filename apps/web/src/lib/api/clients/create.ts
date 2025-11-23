/**
 * Create client API operation
 * Handles creating a new client
 */

import { getAuthHeaders } from './api-utils';
import type { CreateClientInput } from '@/lib/schemas';
import type { Client } from './types';

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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create client');
  }

  return result;
}
