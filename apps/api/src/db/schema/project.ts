import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { client } from './client';
import { projectStatusEnum } from './enums';

export const project = pgTable(
  'project',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: projectStatusEnum('status').default('in_development').notNull(),
    clientId: text('client_id')
      .notNull()
      .references(() => client.id, { onDelete: 'cascade' }),
    repositoryUrl: varchar('repository_url', { length: 2048 }), // Link to external repo
    productionUrl: varchar('production_url', { length: 2048 }), // Live URL
    stagingUrl: varchar('staging_url', { length: 2048 }), // Staging URL
    notes: text('notes'), // Internal notes
    startedAt: timestamp('started_at'),
    deliveredAt: timestamp('delivered_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on foreign key
    index('project_client_id_idx').on(table.clientId),
    // B-Tree index on status for filtering
    index('project_status_idx').on(table.status),
    // Composite index for common query pattern (client's projects by status)
    index('project_client_status_idx').on(table.clientId, table.status),
    // BRIN indexes on timestamps
    index('project_created_at_idx').using('brin', table.createdAt),
    index('project_updated_at_idx').using('brin', table.updatedAt),
    index('project_started_at_idx').using('brin', table.startedAt),
    index('project_delivered_at_idx').using('brin', table.deliveredAt),
  ]
);

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
