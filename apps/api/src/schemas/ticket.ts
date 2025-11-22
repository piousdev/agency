import { z } from 'zod';

/**
 * Query parameters schema for listing tickets
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

/**
 * Schema for creating a new ticket (intake request)
 */
export const createTicketSchema = z.object({
  title: z.string().min(1).max(500, 'Title must be 500 characters or less'),
  description: z.string().min(1),
  type: z.enum(['intake', 'bug', 'support', 'incident', 'change_request']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  clientId: z.string().min(1, 'Client ID is required'),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
});

/**
 * Schema for updating a ticket
 */
export const updateTicketSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['open', 'in_progress', 'pending_client', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedToId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

/**
 * Schema for assigning/unassigning a ticket to a user
 * Pass null to unassign
 */
export const assignTicketSchema = z.object({
  assignedToId: z.string().nullable(),
});
