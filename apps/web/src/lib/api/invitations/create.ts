/**
 * API client for creating invitations
 * Server-side function to call the Hono API
 */

import { getAuthHeaders } from '../users/api-utils';
import type { CreateInvitationInput, InvitationResponse } from './types';

/**
 * Create a new invitation
 * Sends invitation email to specified address
 *
 * @param data - Email and client type for the invitation
 * @returns Invitation response with ID and expiration
 */
export async function createInvitation(data: CreateInvitationInput): Promise<InvitationResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create invitation');
  }

  return response.json();
}
