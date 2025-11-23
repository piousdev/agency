import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { sprintStatusEnum } from './enums';
import { project } from './project';

/**
 * Sprint/Iteration for Agile project management
 * Time-boxed periods for completing a set of tickets
 */
export const sprint = pgTable(
  'sprint',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    goal: text('goal'), // Sprint goal/objective
    status: sprintStatusEnum('status').default('planning').notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    // Velocity tracking
    plannedPoints: integer('planned_points').default(0),
    completedPoints: integer('completed_points').default(0),
    // Sprint number within the project (Sprint 1, Sprint 2, etc.)
    sprintNumber: integer('sprint_number'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('sprint_project_id_idx').on(table.projectId),
    index('sprint_status_idx').on(table.status),
    index('sprint_start_date_idx').using('brin', table.startDate),
    index('sprint_end_date_idx').using('brin', table.endDate),
    index('sprint_project_number_idx').on(table.projectId, table.sprintNumber),
  ]
);

export type Sprint = typeof sprint.$inferSelect;
export type NewSprint = typeof sprint.$inferInsert;
