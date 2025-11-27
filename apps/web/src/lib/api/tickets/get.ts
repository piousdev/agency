/**
 * Get ticket API client
 * Fetches a single ticket by ID
 */

import { buildApiUrl, getAuthHeaders } from './api-utils';

import type { TicketResponse } from './types';

/**
 * Get a ticket by ID
 *
 * @param ticketId - The ticket ID
 * @returns Ticket with relations
 */
export async function getTicket(ticketId: string): Promise<TicketResponse> {
  const url = buildApiUrl(`/api/tickets/${ticketId}`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', response.status, errorText);
    throw new Error(`Failed to fetch ticket: ${String(response.status)}`);
  }

  return (await response.json()) as TicketResponse;
}
