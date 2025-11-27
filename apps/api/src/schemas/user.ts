import { z } from 'zod';

/**
 * Query parameters schema for listing users
 */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isInternal: z.enum(['true', 'false', 'all']).default('all'),
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  image: z.url().nullable().optional(),
  role: z.enum(['admin', 'editor', 'client']).optional(),
  isInternal: z.boolean().optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
});

/**
 * Schema for assigning a role to a user
 */
export const assignRoleSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
});

/**
 * Schema for updating internal status
 */
export const updateInternalStatusSchema = z.object({
  isInternal: z.boolean(),
});

/**
 * Schema for extending expiration
 */
export const extendExpirationSchema = z.object({
  expiresAt: z.iso.datetime().nullable(),
});
