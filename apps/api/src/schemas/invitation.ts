import { z } from 'zod';

/**
 * Schema for creating a new invitation
 * Admin can invite users with specific client types
 */
export const createInvitationSchema = z.object({
  email: z
    .email('Invalid email address')
    .min(3, 'Email must be at least 3 characters')
    .max(255, 'Email must not exceed 255 characters'),
  clientType: z
    .enum(['creative', 'software', 'full_service', 'one_time'])
    .refine((val) => ['creative', 'software', 'full_service', 'one_time'].includes(val), {
      message: 'Client type must be one of: creative, software, full_service, one_time',
    }),
  clientId: z.string().optional().describe('Optional: Link invitation to existing client'),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

/**
 * Schema for validating an invitation token
 * Used to check if invitation exists and is still valid
 */
export const validateInvitationSchema = z.object({
  token: z.string().min(32, 'Invalid invitation token').max(512, 'Invalid invitation token'),
});

export type ValidateInvitationInput = z.infer<typeof validateInvitationSchema>;

/**
 * Schema for accepting an invitation and creating a user account
 * User provides their details and the invitation token
 */
export const acceptInvitationSchema = z.object({
  token: z.string().min(32, 'Invalid invitation token').max(512, 'Invalid invitation token'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  email: z
    .email('Invalid email address')
    .min(3, 'Email must be at least 3 characters')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

/**
 * Response schemas for type safety
 */
export const invitationResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  clientType: z.enum(['creative', 'software', 'full_service', 'one_time']),
  expiresAt: z.date(),
  used: z.boolean(),
  createdAt: z.date(),
});

export type InvitationResponse = z.infer<typeof invitationResponseSchema>;

export const validateInvitationResponseSchema = z.object({
  valid: z.boolean(),
  invitation: invitationResponseSchema.nullable(),
  message: z.string().optional(),
});

export type ValidateInvitationResponse = z.infer<typeof validateInvitationResponseSchema>;

export const acceptInvitationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
});

export type AcceptInvitationResponse = z.infer<typeof acceptInvitationResponseSchema>;
