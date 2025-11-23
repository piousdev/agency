import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { client } from './client';
import {
  ticketPriorityEnum,
  ticketResolutionEnum,
  ticketStatusEnum,
  ticketTypeEnum,
} from './enums';
import { project } from './project';
import { user } from './user';

// Source channel enum - how the ticket was created
export const ticketSourceEnum = pgEnum('ticket_source', [
  'web_form',
  'email',
  'phone',
  'chat',
  'api',
  'internal',
]);

// SLA breach status
export const slaStatusEnum = pgEnum('sla_status', ['on_track', 'at_risk', 'breached']);

export const ticket = pgTable(
  'ticket',
  {
    id: text('id').primaryKey(),
    // Unique ticket number for display (e.g., TKT-0001)
    ticketNumber: varchar('ticket_number', { length: 20 }).unique(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description').notNull(),
    type: ticketTypeEnum('type').notNull(),
    status: ticketStatusEnum('status').default('open').notNull(),
    priority: ticketPriorityEnum('priority').default('medium').notNull(),
    // Source tracking
    source: ticketSourceEnum('source').default('web_form').notNull(),
    // Tags for categorization (stored as JSON array)
    tags: jsonb('tags').$type<string[]>().default([]),
    // SLA tracking
    slaStatus: slaStatusEnum('sla_status').default('on_track'),
    dueAt: timestamp('due_at'), // SLA due date/time
    firstResponseAt: timestamp('first_response_at'), // When first response was made
    firstResponseDueAt: timestamp('first_response_due_at'), // SLA first response due
    // Time tracking (in minutes)
    estimatedTime: integer('estimated_time'), // Estimated time to resolve
    timeSpent: integer('time_spent').default(0), // Actual time spent
    // Contact information (for external submissions)
    contactEmail: varchar('contact_email', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 50 }),
    contactName: varchar('contact_name', { length: 255 }),
    // Additional context
    environment: varchar('environment', { length: 100 }), // e.g., production, staging
    affectedUrl: varchar('affected_url', { length: 2000 }), // URL where issue occurred
    browserInfo: varchar('browser_info', { length: 500 }), // User agent info
    // Custom fields storage (flexible JSON)
    customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),
    // Relations
    projectId: text('project_id').references(() => project.id, {
      onDelete: 'set null',
    }),
    clientId: text('client_id')
      .notNull()
      .references(() => client.id, { onDelete: 'cascade' }),
    createdById: text('created_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    assignedToId: text('assigned_to_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    // Parent ticket for linked/merged tickets
    parentTicketId: text('parent_ticket_id'),

    // ============================================
    // Industry-standard additions (Jira, Zendesk, ClickUp)
    // ============================================

    // Resolution - how the ticket was resolved
    resolution: ticketResolutionEnum('resolution'),

    // Agile/Scrum fields
    storyPoints: integer('story_points'), // Fibonacci: 1, 2, 3, 5, 8, 13, 21
    sprintId: text('sprint_id'), // FK to sprint table (added later to avoid circular dep)

    // Version tracking (like Jira)
    affectedVersion: varchar('affected_version', { length: 50 }), // Version where bug exists
    fixVersion: varchar('fix_version', { length: 50 }), // Version with fix

    // Component/module tracking
    component: varchar('component', { length: 100 }), // e.g., "frontend", "api", "database"

    // Visibility control
    isInternal: boolean('is_internal').default(false).notNull(), // Internal notes vs customer-visible

    // Acceptance criteria (Agile)
    acceptanceCriteria: text('acceptance_criteria'),

    // Timestamps
    resolvedAt: timestamp('resolved_at'),
    closedAt: timestamp('closed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('ticket_project_id_idx').on(table.projectId),
    index('ticket_client_id_idx').on(table.clientId),
    index('ticket_created_by_id_idx').on(table.createdById),
    index('ticket_assigned_to_id_idx').on(table.assignedToId),
    index('ticket_parent_ticket_id_idx').on(table.parentTicketId),
    // B-Tree indexes on enums for filtering
    index('ticket_type_idx').on(table.type),
    index('ticket_status_idx').on(table.status),
    index('ticket_priority_idx').on(table.priority),
    index('ticket_source_idx').on(table.source),
    index('ticket_sla_status_idx').on(table.slaStatus),
    // Composite indexes for common query patterns
    index('ticket_client_status_idx').on(table.clientId, table.status),
    index('ticket_assigned_status_idx').on(table.assignedToId, table.status),
    index('ticket_status_priority_idx').on(table.status, table.priority),
    // SLA monitoring index
    index('ticket_sla_due_idx').on(table.slaStatus, table.dueAt),
    // GIN index for full-text search on title and description
    index('ticket_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.description})`
    ),
    // GIN index for tags array search
    index('ticket_tags_idx').using('gin', table.tags),
    // BRIN indexes on timestamps
    index('ticket_created_at_idx').using('brin', table.createdAt),
    index('ticket_updated_at_idx').using('brin', table.updatedAt),
    index('ticket_resolved_at_idx').using('brin', table.resolvedAt),
    index('ticket_closed_at_idx').using('brin', table.closedAt),
    index('ticket_due_at_idx').using('brin', table.dueAt),
    // New indexes for industry-standard fields
    index('ticket_resolution_idx').on(table.resolution),
    index('ticket_sprint_id_idx').on(table.sprintId),
    index('ticket_component_idx').on(table.component),
    index('ticket_is_internal_idx').on(table.isInternal),
  ]
);

// Ticket Activity for audit trail
export const ticketActivityTypeEnum = pgEnum('ticket_activity_type', [
  'ticket_created',
  'status_changed',
  'priority_changed',
  'assignee_changed',
  'type_changed',
  'comment_added',
  'comment_edited',
  'comment_deleted',
  'file_uploaded',
  'file_deleted',
  'sla_updated',
  'due_date_changed',
  'tags_updated',
  'linked_to_project',
  'merged',
  'reopened',
]);

export const ticketActivity = pgTable(
  'ticket_activity',
  {
    id: text('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    actorId: text('actor_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: ticketActivityTypeEnum('type').notNull(),
    // Flexible metadata for different activity types
    // e.g., { field: 'status', oldValue: 'open', newValue: 'in_progress' }
    metadata: jsonb('metadata').$type<{
      field?: string;
      oldValue?: string | number | null;
      newValue?: string | number | null;
      commentId?: string;
      fileId?: string;
      fileName?: string;
      description?: string;
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('ticket_activity_ticket_id_idx').on(table.ticketId),
    index('ticket_activity_actor_id_idx').on(table.actorId),
    // B-Tree index on type for filtering
    index('ticket_activity_type_idx').on(table.type),
    // Composite index for fetching ticket activity feed
    index('ticket_activity_ticket_created_idx').on(table.ticketId, table.createdAt),
    // BRIN index on timestamp
    index('ticket_activity_created_at_idx').using('brin', table.createdAt),
  ]
);

export type Ticket = typeof ticket.$inferSelect;
export type NewTicket = typeof ticket.$inferInsert;
export type TicketActivity = typeof ticketActivity.$inferSelect;
export type NewTicketActivity = typeof ticketActivity.$inferInsert;
