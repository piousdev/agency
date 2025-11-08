/**
 * Type definitions for invitation-related API operations
 * Centralized types for all invitation endpoints
 */

export interface CreateInvitationInput {
  email: string;
  clientType: 'creative' | 'software' | 'full_service' | 'one_time';
}

export interface InvitationResponse {
  success: boolean;
  message: string;
  invitation: {
    id: string;
    email: string;
    expiresAt: Date;
    token?: string; // DEV ONLY - not returned in production
  };
}
