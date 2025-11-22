/**
 * Zod validation schemas for team capacity management
 * Used for client-side and server-side validation
 */

import { z } from 'zod';

/**
 * Schema for updating user capacity percentage
 * Allows 0-200% to support overallocation scenarios
 */
export const updateCapacitySchema = z.object({
  capacityPercentage: z
    .number()
    .int('Capacity percentage must be a whole number')
    .min(0, 'Capacity percentage cannot be negative')
    .max(200, 'Capacity percentage cannot exceed 200%'),
});

// Type export for TypeScript
export type UpdateCapacityInput = z.infer<typeof updateCapacitySchema>;
