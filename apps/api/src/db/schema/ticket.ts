import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { client } from './client';
import { ticketPriorityEnum, ticketStatusEnum, ticketTypeEnum } from './enums';
import { project } from './project';
import { user } from './user';

export const ticket = pgTable(
  'ticket',
  {
    id: text('id').primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description').notNull(),
    type: ticketTypeEnum('type').notNull(),
    status: ticketStatusEnum('status').default('open').notNull(),
    priority: ticketPriorityEnum('priority').default('medium').notNull(),
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
    // B-Tree indexes on enums for filtering
    index('ticket_type_idx').on(table.type),
    index('ticket_status_idx').on(table.status),
    index('ticket_priority_idx').on(table.priority),
    // Composite indexes for common query patterns
    index('ticket_client_status_idx').on(table.clientId, table.status),
    index('ticket_assigned_status_idx').on(table.assignedToId, table.status),
    index('ticket_status_priority_idx').on(table.status, table.priority),
    // GIN index for full-text search on title and description
    index('ticket_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.description})`
    ),
    // BRIN indexes on timestamps
    index('ticket_created_at_idx').using('brin', table.createdAt),
    index('ticket_updated_at_idx').using('brin', table.updatedAt),
    index('ticket_resolved_at_idx').using('brin', table.resolvedAt),
    index('ticket_closed_at_idx').using('brin', table.closedAt),
  ]
);

export type Ticket = typeof ticket.$inferSelect;
export type NewTicket = typeof ticket.$inferInsert;
