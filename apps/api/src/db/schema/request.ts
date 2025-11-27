import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { client } from './client';
import { confidenceEnum, requestStageEnum, requestTypeEnum, ticketPriorityEnum } from './enums';
import { file } from './file';
import { project } from './project';
import { user } from './user';

/**
 * Request table - Intake pipeline requests
 *
 * Tracks work requests through the 4-stage pipeline:
 * 1. In Treatment (2-day threshold) - Initial triage by PM
 * 2. On Hold (5-7 day threshold) - Awaiting information/decision
 * 3. Estimation (1-day threshold) - Story point estimation by team
 * 4. Ready (12-hour threshold) - Estimated, awaiting conversion
 */
export const request = pgTable(
  'request',
  {
    id: text('id').primaryKey(),
    // Unique request number for display (e.g., REQ-0001)
    requestNumber: varchar('request_number', { length: 20 }).unique(),

    // Basic info
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description').notNull(),
    type: requestTypeEnum('type').notNull(),
    stage: requestStageEnum('stage').default('in_treatment').notNull(),
    priority: ticketPriorityEnum('priority').default('medium').notNull(),

    // Stage tracking (for aging calculation)
    stageEnteredAt: timestamp('stage_entered_at').defaultNow().notNull(),

    // Request details
    businessJustification: text('business_justification'),
    desiredDeliveryDate: timestamp('desired_delivery_date'),
    stepsToReproduce: text('steps_to_reproduce'), // Bug-specific field
    dependencies: text('dependencies'),
    additionalNotes: text('additional_notes'),

    // Estimation fields
    storyPoints: integer('story_points'), // Fibonacci: 1, 2, 3, 5, 8, 13, 21
    confidence: confidenceEnum('confidence'),
    estimationNotes: text('estimation_notes'),
    estimatedAt: timestamp('estimated_at'),

    // Hold tracking
    holdReason: text('hold_reason'),
    holdStartedAt: timestamp('hold_started_at'),

    // Conversion tracking
    convertedToType: varchar('converted_to_type', { length: 20 }), // 'project' or 'ticket'
    convertedToId: text('converted_to_id'),
    convertedAt: timestamp('converted_at'),
    isConverted: boolean('is_converted').default(false).notNull(),

    // Cancellation
    isCancelled: boolean('is_cancelled').default(false).notNull(),
    cancelledReason: text('cancelled_reason'),
    cancelledAt: timestamp('cancelled_at'),

    // Tags for categorization (stored as JSON array)
    tags: jsonb('tags').$type<string[]>().default([]),

    // Custom fields storage (flexible JSON)
    customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

    // Relations
    requesterId: text('requester_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    assignedPmId: text('assigned_pm_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    estimatorId: text('estimator_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    clientId: text('client_id').references(() => client.id, {
      onDelete: 'set null',
    }),
    relatedProjectId: text('related_project_id').references(() => project.id, {
      onDelete: 'set null',
    }),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('request_requester_id_idx').on(table.requesterId),
    index('request_assigned_pm_id_idx').on(table.assignedPmId),
    index('request_estimator_id_idx').on(table.estimatorId),
    index('request_client_id_idx').on(table.clientId),
    index('request_related_project_id_idx').on(table.relatedProjectId),

    // B-Tree indexes on enums for filtering
    index('request_type_idx').on(table.type),
    index('request_stage_idx').on(table.stage),
    index('request_priority_idx').on(table.priority),

    // Composite indexes for common query patterns
    index('request_stage_priority_idx').on(table.stage, table.priority),
    index('request_stage_created_idx').on(table.stage, table.createdAt),
    index('request_stage_entered_idx').on(table.stage, table.stageEnteredAt),

    // For aging queries
    index('request_stage_age_idx').on(table.stage, table.stageEnteredAt, table.priority),

    // For filtering active vs converted/cancelled
    index('request_status_idx').on(table.isConverted, table.isCancelled),

    // GIN index for full-text search on title and description
    index('request_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.description})`
    ),

    // GIN index for tags array search
    index('request_tags_idx').using('gin', table.tags),

    // BRIN indexes on timestamps
    index('request_created_at_idx').using('brin', table.createdAt),
    index('request_updated_at_idx').using('brin', table.updatedAt),
    index('request_stage_entered_at_idx').using('brin', table.stageEnteredAt),
  ]
);

// Request Attachment - links files to requests
export const requestAttachment = pgTable(
  'request_attachment',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => request.id, { onDelete: 'cascade' }),
    fileId: text('file_id')
      .notNull()
      .references(() => file.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('request_attachment_request_id_idx').on(table.requestId),
    index('request_attachment_file_id_idx').on(table.fileId),
  ]
);

// Request History - audit trail for all changes
export const requestHistoryActionEnum = pgEnum('request_history_action', [
  'created',
  'stage_changed',
  'priority_changed',
  'assigned_pm',
  'assigned_estimator',
  'estimated',
  'converted',
  'put_on_hold',
  'resumed',
  'cancelled',
  'updated',
  'attachment_added',
  'attachment_removed',
  'comment_added',
]);

export const requestHistory = pgTable(
  'request_history',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => request.id, { onDelete: 'cascade' }),
    actorId: text('actor_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    action: requestHistoryActionEnum('action').notNull(),
    // Flexible metadata for different action types
    metadata: jsonb('metadata').$type<{
      field?: string;
      oldValue?: string | number | null;
      newValue?: string | number | null;
      oldStage?: string;
      newStage?: string;
      storyPoints?: number;
      confidence?: string;
      convertedToType?: string;
      convertedToId?: string;
      holdReason?: string;
      cancelledReason?: string;
      description?: string;
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('request_history_request_id_idx').on(table.requestId),
    index('request_history_actor_id_idx').on(table.actorId),
    index('request_history_action_idx').on(table.action),
    // Composite index for fetching request history feed
    index('request_history_request_created_idx').on(table.requestId, table.createdAt),
    // BRIN index on timestamp
    index('request_history_created_at_idx').using('brin', table.createdAt),
  ]
);

// Type exports
export type Request = typeof request.$inferSelect;
export type NewRequest = typeof request.$inferInsert;
export type RequestAttachment = typeof requestAttachment.$inferSelect;
export type NewRequestAttachment = typeof requestAttachment.$inferInsert;
export type RequestHistory = typeof requestHistory.$inferSelect;
export type NewRequestHistory = typeof requestHistory.$inferInsert;
