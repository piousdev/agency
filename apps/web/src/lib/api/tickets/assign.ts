/**
 * Assign ticket API operation
 * Handles assigning tickets to team members
 */

import { getAuthHeaders } from './api-utils';

import type { AssignTicketInput, TicketResponse } from './types';

/**
 * Assign a ticket to a team member
 * Protected: Requires authentication and internal team member status
 * Note: Automatically changes status to 'in_progress' when assigned
 *
 * @param ticketId - ID of the ticket to assign
 * @param data - Assignment data (userId or null to unassign)
 * @returns Result object with success status and updated ticket or error message
 */
export async function assignTicket(
  ticketId: string,
  data: AssignTicketInput
): Promise<{ success: true; data: TicketResponse['data'] } | { success: false; error: string }> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${String(process.env.NEXT_PUBLIC_API_URL)}/api/tickets/${ticketId}/assign`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as { message?: string; data?: TicketResponse['data'] };

    if (!response.ok) {
      return { success: false, error: result.message ?? 'Failed to assign ticket' };
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
