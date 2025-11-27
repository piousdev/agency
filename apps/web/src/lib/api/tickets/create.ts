/**
 * Create ticket API operation
 * Handles creating new intake requests and other ticket types
 */

import { getAuthHeaders } from './api-utils';

import type { CreateTicketInput, TicketResponse } from './types';

/**
 * Create a new ticket (intake request or other type)
 * Protected: Requires authentication and internal team member status
 *
 * @param data - Ticket creation data
 * @returns Result object with success status and created ticket or error message
 */
export async function createTicket(
  data: CreateTicketInput
): Promise<{ success: true; data: TicketResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${String(process.env.NEXT_PUBLIC_API_URL)}/api/tickets`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(data),
    });

    const result = (await response.json()) as { message?: string; data?: TicketResponse['data'] };

    if (!response.ok) {
      return { success: false, error: result.message ?? 'Failed to create ticket' };
    }

    if (!result.data) {
      return { success: false, error: 'No data returned from server' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}
