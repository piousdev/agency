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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${apiUrl}/api/invitations/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    const errorMessage = error.message ?? 'Failed to create invitation';
    throw new Error(errorMessage);
  }

  return response.json() as Promise<InvitationResponse>;
}
