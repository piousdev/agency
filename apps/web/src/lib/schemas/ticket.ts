import { z } from 'zod';

/**
 * Ticket type enum values
 */
export const ticketTypeValues = ['intake', 'bug', 'support', 'incident', 'change_request'] as const;

export type TicketType = (typeof ticketTypeValues)[number];

/**
 * Ticket status enum values
 */
export const ticketStatusValues = [
  'open',
  'in_progress',
  'pending_client',
  'resolved',
  'closed',
] as const;

export type TicketStatus = (typeof ticketStatusValues)[number];

/**
 * Ticket priority enum values
 */
export const ticketPriorityValues = ['low', 'medium', 'high', 'critical'] as const;

export type TicketPriority = (typeof ticketPriorityValues)[number];

/**
 * Ticket source enum values
 */
export const ticketSourceValues = [
  'web_form',
  'email',
  'phone',
  'chat',
  'api',
  'internal',
] as const;

export type TicketSource = (typeof ticketSourceValues)[number];

/**
 * SLA status enum values
 */
export const slaStatusValues = ['on_track', 'at_risk', 'breached'] as const;

export type SlaStatus = (typeof slaStatusValues)[number];

/**
 * Type options for UI select components
 */
export const ticketTypeOptions = [
  { value: 'intake', label: 'Intake Request' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'support', label: 'Support' },
  { value: 'incident', label: 'Incident' },
  { value: 'change_request', label: 'Change Request' },
] as const;

/**
 * Status options for UI select components
 */
export const ticketStatusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_client', label: 'Pending Client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

/**
 * Priority options for UI select components
 */
export const ticketPriorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;

/**
 * Source options for UI select components
 */
export const ticketSourceOptions = [
  { value: 'web_form', label: 'Web Form' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'chat', label: 'Chat' },
  { value: 'api', label: 'API' },
  { value: 'internal', label: 'Internal' },
] as const;

/**
 * SLA status options for UI select components
 */
export const slaStatusOptions = [
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'breached', label: 'Breached' },
] as const;

/**
 * URL validation helper
 */
const optionalUrl = z
  .url('Must be a valid URL')
  .max(2000, 'URL too long')
  .optional()
  .or(z.literal(''));

/**
 * Schema for creating a new ticket
 */
export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(ticketTypeValues).default('intake'),
  priority: z.enum(ticketPriorityValues).default('medium'),
  source: z.enum(ticketSourceValues).default('web_form'),
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
  // Tags for categorization
  tags: z.array(z.string()).optional(),
  // SLA fields - use string for API compatibility (ISO date format)
  dueAt: z.string().optional(),
  // Contact information (for external submissions)
  contactEmail: z.email('Invalid email').max(255).optional().or(z.literal('')),
  contactPhone: z.string().max(50).optional().or(z.literal('')),
  contactName: z.string().max(255).optional().or(z.literal('')),
  // Additional context
  environment: z.string().max(100).optional().or(z.literal('')),
  affectedUrl: optionalUrl,
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

/**
 * Schema for updating an existing ticket
 * Note: Uses .optional() without .nullable() to match API UpdateTicketInput type
 */
export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters')
    .optional(),
  description: z.string().optional(),
  type: z.enum(ticketTypeValues).optional(),
  status: z.enum(ticketStatusValues).optional(),
  priority: z.enum(ticketPriorityValues).optional(),
  source: z.enum(ticketSourceValues).optional(),
  clientId: z.string().min(1, 'Client is required').optional(),
  projectId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  // Tags
  tags: z.array(z.string()).optional(),
  // SLA fields - use string for API compatibility (ISO date format)
  slaStatus: z.enum(slaStatusValues).optional(),
  dueAt: z.string().optional().nullable(),
  firstResponseAt: z.string().optional().nullable(),
  firstResponseDueAt: z.string().optional().nullable(),
  // Time tracking
  estimatedTime: z.coerce.number().int().positive().optional().nullable(),
  timeSpent: z.coerce.number().int().min(0).optional(),
  // Contact information
  contactEmail: z.email('Invalid email').max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  contactName: z.string().max(255).optional(),
  // Additional context
  environment: z.string().max(100).optional().nullable(),
  affectedUrl: optionalUrl.nullable(),
  browserInfo: z.string().max(500).optional().nullable(),
  // Custom fields
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

/**
 * Schema for ticket status update (quick action)
 */
export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatusValues),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;

/**
 * Schema for ticket priority update (quick action)
 */
export const updateTicketPrioritySchema = z.object({
  priority: z.enum(ticketPriorityValues),
});

export type UpdateTicketPriorityInput = z.infer<typeof updateTicketPrioritySchema>;

/**
 * Schema for assigning a ticket to a team member
 */
export const assignTicketSchema = z.object({
  assignedToId: z.string().nullable(),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;

/**
 * Schema for linking a ticket to a project
 */
export const linkTicketToProjectSchema = z.object({
  projectId: z.string().nullable(),
});

export type LinkTicketToProjectInput = z.infer<typeof linkTicketToProjectSchema>;

/**
 * Schema for updating ticket tags
 */
export const updateTicketTagsSchema = z.object({
  tags: z.array(z.string()),
});

export type UpdateTicketTagsInput = z.infer<typeof updateTicketTagsSchema>;

/**
 * Schema for logging time on a ticket
 */
export const logTicketTimeSchema = z.object({
  minutes: z.coerce.number().int().positive('Time must be positive'),
  description: z.string().max(500).optional(),
});

export type LogTicketTimeInput = z.infer<typeof logTicketTimeSchema>;

/**
 * Schema for bulk ticket operations
 */
export const bulkTicketOperationSchema = z.object({
  ticketIds: z
    .array(z.string())
    .min(1, 'Select at least one ticket')
    .max(100, 'Maximum 100 tickets'),
  operation: z.enum(['update_status', 'update_priority', 'assign', 'link_project', 'delete']),
  status: z.enum(ticketStatusValues).optional(),
  priority: z.enum(ticketPriorityValues).optional(),
  assignedToId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export type BulkTicketOperationInput = z.infer<typeof bulkTicketOperationSchema>;

/**
 * Schema for list tickets query parameters
 */
export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'priority', 'status', 'dueAt', 'title'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  type: z.enum(ticketTypeValues).optional(),
  status: z.enum(ticketStatusValues).optional(),
  priority: z.enum(ticketPriorityValues).optional(),
  slaStatus: z.enum(slaStatusValues).optional(),
  source: z.enum(ticketSourceValues).optional(),
  assignedToId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
