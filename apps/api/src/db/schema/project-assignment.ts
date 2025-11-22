import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { project } from './project';
import { user } from './user';

export const projectAssignment = pgTable(
  'project_assignment',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // B-Tree index on foreign keys for efficient lookups
    index('project_assignment_project_id_idx').on(table.projectId),
    index('project_assignment_user_id_idx').on(table.userId),
    // Composite index for unique constraint and common query pattern
    index('project_assignment_project_user_idx').on(table.projectId, table.userId),
  ]
);

export type ProjectAssignment = typeof projectAssignment.$inferSelect;
export type NewProjectAssignment = typeof projectAssignment.$inferInsert;
