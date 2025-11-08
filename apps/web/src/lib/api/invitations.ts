/**
 * API client for invitation-related operations
 * Handles creation, validation, and acceptance of invitations
 */

import { headers } from 'next/headers';

export interface InvitationData {
  id: string;
  email: string;
  clientType: string | null;
  expiresAt: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  invitation?: InvitationData;
  message?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  name: string;
  email: string;
  password: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface CreateInvitationRequest {
  email: string;
  clientType: 'creative' | 'software' | 'full_service' | 'one_time';
}

export interface CreateInvitationResponse {
  success: boolean;
  message: string;
  invitation: {
    id: string;
    email: string;
    expiresAt: Date;
    token?: string; // DEV ONLY
  };
}

/**
 * Helper to get authentication headers for server-side API calls
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const headersList = await headers();
  return {
    'Content-Type': 'application/json',
    cookie: headersList.get('cookie') || '',
  };
}

/**
 * Creates a new invitation and sends it to the specified email
 * Requires authentication and internal team member status
 * @param data - Email and client type for the invitation
 * @returns Invitation creation result
 */
export async function createInvitation(
  data: CreateInvitationRequest
): Promise<CreateInvitationResponse> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create invitation');
  }

  return result;
}

/**
 * Validates an invitation token
 * @param token - The invitation token from the URL
 * @returns Validation result with invitation data if valid
 */
export async function validateInvitation(token: string): Promise<ValidateInvitationResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/invitations/validate/${token}`
  );

  if (!response.ok) {
    throw new Error('Failed to validate invitation');
  }

  return response.json();
}

/**
 * Accepts an invitation and creates a user account
 * @param data - User registration data with invitation token
 * @returns Account creation result
 */
export async function acceptInvitation(
  data: AcceptInvitationRequest
): Promise<AcceptInvitationResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to accept invitation');
  }

  return result;
}
