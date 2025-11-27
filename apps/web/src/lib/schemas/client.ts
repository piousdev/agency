import { z } from 'zod';

/**
 * Client type enum values
 */
export const clientTypeValues = ['creative', 'software', 'full_service', 'one_time'] as const;

export type ClientType = (typeof clientTypeValues)[number];

/**
 * Client type options for UI select components
 */
export const clientTypeOptions = [
  { value: 'creative', label: 'Creative' },
  { value: 'software', label: 'Software' },
  { value: 'full_service', label: 'Full Service' },
  { value: 'one_time', label: 'One Time' },
] as const;

/**
 * Email validation helper
 */
const emailSchema = z
  .email('Must be a valid email address')
  .max(255, 'Email must be less than 255 characters');

/**
 * URL validation helper
 */
const optionalUrl = z
  .url('Must be a valid URL')
  .max(2048, 'URL too long')
  .optional()
  .or(z.literal(''));

/**
 * Schema for creating a new client
 */
export const createClientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .max(255, 'Client name must be less than 255 characters'),
  type: z.enum(clientTypeValues).default('creative'),
  email: emailSchema,
  phone: z.string().max(50, 'Phone number too long').optional().or(z.literal('')),
  website: optionalUrl,
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

/**
 * Schema for updating an existing client
 */
export const updateClientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .max(255, 'Client name must be less than 255 characters')
    .optional(),
  type: z.enum(clientTypeValues).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(50, 'Phone number too long').optional().nullable(),
  website: optionalUrl.nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

/**
 * Schema for client status update (activate/deactivate)
 */
export const updateClientStatusSchema = z.object({
  active: z.boolean(),
});

export type UpdateClientStatusInput = z.infer<typeof updateClientStatusSchema>;

/**
 * Schema for bulk client operations
 */
export const bulkClientOperationSchema = z.object({
  clientIds: z
    .array(z.string())
    .min(1, 'Select at least one client')
    .max(100, 'Maximum 100 clients'),
  operation: z.enum(['activate', 'deactivate', 'update_type', 'delete']),
  type: z.enum(clientTypeValues).optional(),
});

export type BulkClientOperationInput = z.infer<typeof bulkClientOperationSchema>;

/**
 * Schema for list clients query parameters
 */
export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'type']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  type: z.enum(clientTypeValues).optional(),
  active: z.coerce.boolean().optional(),
});

export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
