/**
 * Ticket management API client
 * Centralized exports for all ticket-related API operations
 *
 * Usage in Server Components or Server Actions:
 * ```tsx
 * import { listTickets, createTicket, assignTicket } from "@/lib/api/tickets";
 * ```
 */

// Ticket operations
export { assignTicket } from './assign';
export { createTicket } from './create';
export { getTicket } from './get';
export { listTickets } from './list';
export { updateTicket } from './update';

// Helper utilities (exported for testing/advanced use)
export { buildApiUrl, getAuthHeaders } from './api-utils';

// Type exports
export type {
  ApiResponse,
  AssignTicketInput,
  CreateTicketInput,
  ListTicketsParams,
  PaginatedTicketsResponse,
  Ticket,
  TicketResponse,
  TicketWithRelations,
  UpdateTicketInput,
} from './types';
