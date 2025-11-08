import { z } from 'zod';

/**
 * Validation schema for creating a new invitation
 * Admin can invite users by email
 */
export const createInvitationSchema = z.object({
  email: z
    .email('Invalid email address')
    .min(3, 'Email must be at least 3 characters')
    .max(255, 'Email must not exceed 255 characters'),
  clientType: z.enum(['creative', 'software', 'full_service', 'one_time']).default('creative'),
});

export type CreateInvitationFormData = z.infer<typeof createInvitationSchema>;

/**
 * Validation schema for accepting an invitation
 * Matches API requirements with additional confirmPassword for UX
 */
export const acceptInviteSchema = z
  .object({
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
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;
