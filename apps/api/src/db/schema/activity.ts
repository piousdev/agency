import { index, pgEnum, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { project } from './project';
import { user } from './user';

/**
 * Entity type for activity tracking
 * Allows unified activity logging across different entities
 */
export const entityTypeEnum = pgEnum('entity_type', ['project', 'ticket', 'client', 'label']);

/**
 * Activity types for audit trail
 * Covers all CRUD operations and common entity changes
 */
export const activityTypeEnum = pgEnum('activity_type', [
  // Entity lifecycle
  'created',
  'updated',
  'deleted',
  'restored',
  'archived',

  // Legacy project-specific types (for backward compatibility)
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

  // Assignment changes
  'assigned',
  'unassigned',

  // Bulk operations
  'bulk_status_changed',
  'bulk_assigned',
  'bulk_deleted',

  // Field-specific changes
  'field_changed',
]);

/**
 * Metadata structure for activity records
 * Provides detailed change information
 */
export interface ActivityMetadata {
  // Field change tracking
  field?: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;

  // Multiple field changes (for batch updates)
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;

  // Related entity references
  assigneeId?: string;
  assigneeName?: string;
  commentId?: string;
  fileId?: string;
  fileName?: string;

  // Bulk operation tracking
  affectedIds?: string[];
  affectedCount?: number;

  // Additional context
  description?: string;
  reason?: string;

  // Any additional data
  [key: string]: unknown;
}

/**
 * Unified activity table for audit logging
 *
 * Supports tracking changes across all entity types:
 * - Projects
 * - Tickets
 * - Clients
 *
 * The table uses entityType + entityId for flexible entity referencing,
 * while maintaining projectId for backward compatibility with existing code.
 */
export const activity = pgTable(
  'activity',
  {
    id: text('id').primaryKey(),

    // Unified entity reference (new approach)
    entityType: entityTypeEnum('entity_type'),
    entityId: text('entity_id'),

    // Legacy project reference (kept for backward compatibility)
    // New code should use entityType='project' + entityId instead
    projectId: text('project_id').references(() => project.id, { onDelete: 'cascade' }),

    // Actor who performed the action
    actorId: text('actor_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Type of activity
    type: activityTypeEnum('type').notNull(),

    // Flexible metadata for different activity types
    // e.g., { field: 'status', oldValue: 'in_development', newValue: 'in_review' }
    metadata: jsonb('metadata').$type<ActivityMetadata>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('activity_project_id_idx').on(table.projectId),
    index('activity_actor_id_idx').on(table.actorId),

    // Unified entity indexes
    index('activity_entity_type_idx').on(table.entityType),
    index('activity_entity_id_idx').on(table.entityId),
    index('activity_entity_type_entity_id_idx').on(table.entityType, table.entityId),

    // B-Tree index on type for filtering
    index('activity_type_idx').on(table.type),

    // Composite index for fetching project activity feed (legacy)
    index('activity_project_created_idx').on(table.projectId, table.createdAt),

    // Composite index for fetching entity activity feed (new)
    index('activity_entity_created_idx').on(table.entityType, table.entityId, table.createdAt),

    // BRIN index on timestamp
    index('activity_created_at_idx').using('brin', table.createdAt),
  ]
);

export type Activity = typeof activity.$inferSelect;
export type NewActivity = typeof activity.$inferInsert;
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
export type EntityType = (typeof entityTypeEnum.enumValues)[number];
