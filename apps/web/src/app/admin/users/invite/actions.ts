/**
 * Server Actions for invitation management
 * Handles creating and sending invitations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createInvitation } from '@/lib/api/invitations';
import { requireRole } from '@/lib/auth/session';
import { type CreateInvitationFormData, createInvitationSchema } from '@/lib/schemas/invitation';

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  invitationToken?: string; // DEV ONLY - for displaying invitation link
};

/**
 * Create and send a new invitation
 * Protected: Requires internal team member status
 *
 * @param prevState - Previous action state
 * @param formData - Form data with email and client type
 * @returns Action state with success/error information
 */
export async function createInvitationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Layer 2: Server-side authentication check
    await requireRole('internal');

    const data: CreateInvitationFormData = {
      email: formData.get('email') as string,
      clientType: ((formData.get('clientType') as string) ||
        'creative') as CreateInvitationFormData['clientType'],
    };

    // Validate with Zod
    const validation = createInvitationSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // Call API to create invitation
    const result = await createInvitation(validation.data);

    // Revalidate the users page to show any changes
    revalidatePath('/admin/users');

    // Return success with invitation details (for dev mode link display)
    return {
      success: true,
      message: `Invitation sent successfully to ${validation.data.email}`,
      invitationToken: result.invitation.token, // DEV ONLY
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create invitation',
    };
  }
}
