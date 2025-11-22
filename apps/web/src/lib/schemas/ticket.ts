/**
 * Zod validation schemas for ticket management forms
 * Used for client-side and server-side validation
 */

import { z } from 'zod';

/**
 * Schema for creating a new ticket (intake request)
 */
export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['intake', 'bug', 'support', 'incident', 'change_request']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
});

/**
 * Schema for updating an existing ticket
 * All fields are optional to support partial updates
 */
export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters')
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  type: z.enum(['intake', 'bug', 'support', 'incident', 'change_request']).optional(),
  status: z.enum(['open', 'in_progress', 'pending_client', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  projectId: z.string().nullable().optional(),
});

/**
 * Schema for assigning a ticket to a team member
 */
export const assignTicketSchema = z.object({
  assignedToId: z.string().nullable(),
});

/**
 * Schema for list tickets query parameters
 */
export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: z.enum(['intake', 'bug', 'support', 'incident', 'change_request']).optional(),
  status: z.enum(['open', 'in_progress', 'pending_client', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedToId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

// Type exports for TypeScript
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
