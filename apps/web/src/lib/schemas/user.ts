/**
 * Zod validation schemas for user management forms
 * Used for client-side and server-side validation
 */

import { z } from 'zod';

/**
 * Schema for updating user details
 * All fields are optional to support partial updates
 */
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.email('Invalid email address').optional(),
  image: z.url('Invalid image URL').nullable().optional(),
  role: z.enum(['admin', 'editor', 'client']).optional(),
  isInternal: z.boolean().optional(),
  expiresAt: z.iso.datetime('Invalid date format').nullable().optional(),
});

/**
 * Schema for toggling internal team member status
 */
export const updateInternalStatusSchema = z.object({
  isInternal: z.boolean(),
});

/**
 * Schema for extending user expiration date
 */
export const extendExpirationSchema = z.object({
  expiresAt: z.iso
    .datetime('Invalid date format')
    .nullable()
    .refine(
      (date: string | number | Date | null) => {
        if (date === null) return true;
        return new Date(date) > new Date();
      },
      {
        message: 'Expiration date must be in the future',
      }
    ),
});

/**
 * Schema for assigning a role to a user
 */
export const assignRoleSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
});

/**
 * Schema for deleting a user (confirmation)
 */
export const deleteUserSchema = z.object({
  confirmEmail: z.email('Invalid email address'),
});

/**
 * Schema for list users query parameters
 */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isInternal: z.enum(['true', 'false', 'all']).default('all'),
});

// Type exports for TypeScript
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateInternalStatusInput = z.infer<typeof updateInternalStatusSchema>;
export type ExtendExpirationInput = z.infer<typeof extendExpirationSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
