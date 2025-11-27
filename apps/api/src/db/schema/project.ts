import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { client } from './client';
import { projectPriorityEnum, projectStatusEnum, projectVisibilityEnum } from './enums';
import { user } from './user';

export const project = pgTable(
  'project',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: projectStatusEnum('status').default('in_development').notNull(),
    priority: projectPriorityEnum('priority').default('medium').notNull(),
    clientId: text('client_id')
      .notNull()
      .references(() => client.id, { onDelete: 'cascade' }),
    // Completion percentage for progress tracking (0-100%)
    completionPercentage: integer('completion_percentage').default(0).notNull(),
    // Time and budget tracking
    estimatedHours: integer('estimated_hours'),
    actualHours: integer('actual_hours').default(0),
    budgetAmount: numeric('budget_amount', { precision: 12, scale: 2 }),
    budgetCurrency: varchar('budget_currency', { length: 3 }).default('USD'),
    // Due date for project delivery deadline
    dueDate: timestamp('due_date'),
    repositoryUrl: varchar('repository_url', { length: 2048 }), // Link to external repo
    productionUrl: varchar('production_url', { length: 2048 }), // Live URL
    stagingUrl: varchar('staging_url', { length: 2048 }), // Staging URL
    notes: text('notes'), // Internal notes

    // ============================================
    // Industry-standard additions (Monday, Asana, ClickUp)
    // ============================================

    // Visual customization
    color: varchar('color', { length: 7 }), // Hex color for project identification
    icon: varchar('icon', { length: 50 }), // Icon identifier (e.g., "folder", "rocket")

    // Visibility and access control
    visibility: projectVisibilityEnum('visibility').default('team').notNull(),
    isTemplate: boolean('is_template').default(false).notNull(), // Template projects

    // Ownership (different from assignees)
    ownerId: text('owner_id').references(() => user.id, { onDelete: 'set null' }),

    // Goals and objectives
    goals: text('goals'), // Project objectives/success criteria

    // Custom fields for extensibility
    customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

    // Dates
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
    // B-Tree index on priority for filtering
    index('project_priority_idx').on(table.priority),
    // BRIN indexes on timestamps
    index('project_created_at_idx').using('brin', table.createdAt),
    index('project_updated_at_idx').using('brin', table.updatedAt),
    index('project_started_at_idx').using('brin', table.startedAt),
    index('project_delivered_at_idx').using('brin', table.deliveredAt),
    index('project_due_date_idx').using('brin', table.dueDate),
    // Check constraint for completion percentage (0-100%)
    check(
      'project_completion_percentage_check',
      sql`${table.completionPercentage} >= 0 AND ${table.completionPercentage} <= 100`
    ),
    // New indexes for industry-standard fields
    index('project_visibility_idx').on(table.visibility),
    index('project_is_template_idx').on(table.isTemplate),
    index('project_owner_id_idx').on(table.ownerId),
  ]
);

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
