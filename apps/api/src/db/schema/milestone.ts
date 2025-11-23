import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { milestoneStatusEnum } from './enums';
import { project } from './project';

/**
 * Project milestones - significant checkpoints in a project
 * Used to track major deliverables and deadlines
 */
export const milestone = pgTable(
  'milestone',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    status: milestoneStatusEnum('status').default('pending').notNull(),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('milestone_project_id_idx').on(table.projectId),
    index('milestone_status_idx').on(table.status),
    index('milestone_due_date_idx').using('brin', table.dueDate),
    index('milestone_project_sort_idx').on(table.projectId, table.sortOrder),
  ]
);

export type Milestone = typeof milestone.$inferSelect;
export type NewMilestone = typeof milestone.$inferInsert;
