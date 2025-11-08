import { z } from 'zod';

/**
 * Query parameters schema for listing roles
 */
export const listRolesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z.enum(['name', 'roleType', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  roleType: z.enum(['internal', 'client', 'all']).default('all'),
});
