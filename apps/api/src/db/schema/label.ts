import { index, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { labelScopeEnum } from './enums';
import { project } from './project';
import { ticket } from './ticket';

/**
 * Reusable colored labels for categorization
 * Can be global or scoped to specific entity types
 */
export const label = pgTable(
  'label',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    color: varchar('color', { length: 7 }).notNull().default('#6B7280'), // Hex color
    description: text('description'),
    scope: labelScopeEnum('scope').default('global').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('label_scope_idx').on(table.scope), index('label_name_idx').on(table.name)]
);

/**
 * Many-to-many: Labels on projects
 */
export const projectLabel = pgTable(
  'project_label',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.labelId] }),
    index('project_label_project_id_idx').on(table.projectId),
    index('project_label_label_id_idx').on(table.labelId),
  ]
);

/**
 * Many-to-many: Labels on tickets
 */
export const ticketLabel = pgTable(
  'ticket_label',
  {
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.ticketId, table.labelId] }),
    index('ticket_label_ticket_id_idx').on(table.ticketId),
    index('ticket_label_label_id_idx').on(table.labelId),
  ]
);

export type Label = typeof label.$inferSelect;
export type NewLabel = typeof label.$inferInsert;
export type ProjectLabel = typeof projectLabel.$inferSelect;
export type NewProjectLabel = typeof projectLabel.$inferInsert;
export type TicketLabel = typeof ticketLabel.$inferSelect;
export type NewTicketLabel = typeof ticketLabel.$inferInsert;
