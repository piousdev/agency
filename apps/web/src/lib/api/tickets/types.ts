/**
 * Type definitions for ticket management API client
 * Shared types used across all ticket-related API operations
 */

// Enums
export type TicketType = 'intake' | 'bug' | 'support' | 'incident' | 'change_request';
export type TicketStatus = 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketSource = 'web_form' | 'email' | 'phone' | 'chat' | 'api' | 'internal';
export type SlaStatus = 'on_track' | 'at_risk' | 'breached';

export type TicketActivityType =
  | 'ticket_created'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'type_changed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'file_uploaded'
  | 'file_deleted'
  | 'sla_updated'
  | 'due_date_changed'
  | 'tags_updated'
  | 'linked_to_project'
  | 'merged'
  | 'reopened';

export interface Ticket {
  id: string;
  ticketNumber: string | null;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  tags: string[];
  // SLA tracking
  slaStatus: SlaStatus | null;
  dueAt: string | null;
  firstResponseAt: string | null;
  firstResponseDueAt: string | null;
  // Time tracking
  estimatedTime: number | null;
  timeSpent: number | null;
  // Contact information
  contactEmail: string | null;
  contactPhone: string | null;
  contactName: string | null;
  // Additional context
  environment: string | null;
  affectedUrl: string | null;
  browserInfo: string | null;
  customFields: Record<string, unknown>;
  // Relations
  clientId: string;
  projectId: string | null;
  assignedToId: string | null;
  createdById: string;
  parentTicketId: string | null;
  // Timestamps
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface TicketFile {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface TicketActivityMetadata {
  field?: string;
  oldValue?: string | number | null;
  newValue?: string | number | null;
  commentId?: string;
  fileId?: string;
  fileName?: string;
  description?: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  type: TicketActivityType;
  metadata: TicketActivityMetadata | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface TicketWithRelations extends Ticket {
  client: {
    id: string;
    name: string;
    type: string;
  };
  project?: {
    id: string;
    name: string;
    status: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  comments?: TicketComment[];
  files?: TicketFile[];
  activities?: TicketActivity[];
  childTickets?: {
    id: string;
    ticketNumber: string | null;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
  }[];
  parentTicket?: {
    id: string;
    ticketNumber: string | null;
    title: string;
  } | null;
}

export interface PaginatedTicketsResponse {
  success: boolean;
  data: TicketWithRelations[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TicketResponse {
  success: boolean;
  data: TicketWithRelations;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ListTicketsParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  type?: TicketType;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
  clientId?: string;
  projectId?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  type: TicketType;
  priority?: TicketPriority;
  clientId: string;
  projectId?: string;
  assignedToId?: string;
  source?: TicketSource;
  tags?: string[];
  dueAt?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  environment?: string;
  affectedUrl?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  type?: TicketType;
  status?: TicketStatus;
  priority?: TicketPriority;
  projectId?: string | null;
  tags?: string[];
  dueAt?: string | null;
  estimatedTime?: number | null;
  timeSpent?: number | null;
  environment?: string | null;
  affectedUrl?: string | null;
}

export interface AssignTicketInput {
  assignedToId: string | null;
}
