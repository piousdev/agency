import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'client']);

export const projectStatusEnum = pgEnum('project_status', [
  'proposal',
  'in_development',
  'in_review',
  'delivered',
  'on_hold',
  'maintenance',
  'archived',
]);

export const ticketTypeEnum = pgEnum('ticket_type', [
  'intake',
  'bug',
  'support',
  'incident',
  'change_request',
]);

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'pending_client',
  'resolved',
  'closed',
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'critical']);

export const projectPriorityEnum = pgEnum('project_priority', ['low', 'medium', 'high', 'urgent']);

export const clientTypeEnum = pgEnum('client_type', [
  'creative',
  'software',
  'full_service',
  'one_time',
]);
