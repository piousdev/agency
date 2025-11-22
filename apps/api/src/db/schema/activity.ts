import { index, pgEnum, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { project } from './project';
import { user } from './user';

export const activityTypeEnum = pgEnum('activity_type', [
  'project_created',
  'project_updated',
  'status_changed',
  'assignee_added',
  'assignee_removed',
  'comment_added',
  'file_uploaded',
  'file_deleted',
  'priority_changed',
  'due_date_changed',
]);

export const activity = pgTable(
  'activity',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    actorId: text('actor_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: activityTypeEnum('type').notNull(),
    // Flexible metadata for different activity types
    // e.g., { field: 'status', oldValue: 'in_development', newValue: 'in_review' }
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('activity_project_id_idx').on(table.projectId),
    index('activity_actor_id_idx').on(table.actorId),
    // B-Tree index on type for filtering
    index('activity_type_idx').on(table.type),
    // Composite index for fetching project activity feed
    index('activity_project_created_idx').on(table.projectId, table.createdAt),
    // BRIN index on timestamp
    index('activity_created_at_idx').using('brin', table.createdAt),
  ]
);

export type Activity = typeof activity.$inferSelect;
export type NewActivity = typeof activity.$inferInsert;
