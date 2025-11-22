/**
 * Update ticket API operation
 * Handles updating ticket details
 */

import { getAuthHeaders } from './api-utils';
import type { TicketResponse, UpdateTicketInput } from './types';

/**
 * Update an existing ticket
 * Protected: Requires authentication and internal team member status
 *
 * @param ticketId - ID of the ticket to update
 * @param data - Partial ticket data to update
 * @returns Updated ticket with related data
 * @throws Error if API request fails or ticket not found
 */
export async function updateTicket(
  ticketId: string,
  data: UpdateTicketInput
): Promise<TicketResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update ticket');
  }

  return result;
}
