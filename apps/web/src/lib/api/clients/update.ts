/**
 * Update client API operation
 * Handles updating an existing client
 */

import { getAuthHeaders } from './api-utils';
import type { UpdateClientInput } from '@/lib/schemas';
import type { Client } from './types';

export interface UpdateClientResponse {
  success: boolean;
  data: Client;
  message: string;
}

/**
 * Update an existing client
 * Protected: Requires authentication and internal team member status
 *
 * @param clientId - ID of the client to update
 * @param data - Client data to update
 * @returns Updated client data
 * @throws Error if API request fails
 */
export async function updateClient(
  clientId: string,
  data: UpdateClientInput
): Promise<UpdateClientResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update client');
  }

  return result;
}
