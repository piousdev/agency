import { index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';
import { project } from './project';
import { ticket } from './ticket';

/**
 * Watcher/Subscriber table for projects
 * Allows users to follow projects without being assigned
 */
export const projectWatcher = pgTable(
  'project_watcher',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.userId] }),
    index('project_watcher_project_id_idx').on(table.projectId),
    index('project_watcher_user_id_idx').on(table.userId),
  ]
);

/**
 * Watcher/Subscriber table for tickets
 * Allows users to follow tickets without being assigned
 */
export const ticketWatcher = pgTable(
  'ticket_watcher',
  {
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.ticketId, table.userId] }),
    index('ticket_watcher_ticket_id_idx').on(table.ticketId),
    index('ticket_watcher_user_id_idx').on(table.userId),
  ]
);

export type ProjectWatcher = typeof projectWatcher.$inferSelect;
export type NewProjectWatcher = typeof projectWatcher.$inferInsert;
export type TicketWatcher = typeof ticketWatcher.$inferSelect;
export type NewTicketWatcher = typeof ticketWatcher.$inferInsert;
