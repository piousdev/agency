import { z } from 'zod';

/**
 * Client type enum
 */
export const clientTypeEnum = z.enum(['creative', 'software', 'full_service', 'one_time']);

/**
 * Schema for creating a new client
 */
export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(255),
  type: clientTypeEnum.default('creative'),
  email: z.email('Must be a valid email address').max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  website: z.url().max(2048).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

/**
 * Schema for updating an existing client
 */
export const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: clientTypeEnum.optional(),
  email: z.email().max(255).optional(),
  phone: z.string().max(50).optional().nullable(),
  website: z.url().max(2048).optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

/**
 * Schema for updating client status
 */
export const updateClientStatusSchema = z.object({
  active: z.boolean(),
});
