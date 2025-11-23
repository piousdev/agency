/**
 * Activity Logging Utility
 *
 * Provides functions to log activities for audit trail and activity feeds.
 * Supports all entity types: projects, tickets, and clients.
 */

import { nanoid } from 'nanoid';
import { db } from '../db';
import {
  activity,
  type ActivityMetadata,
  type ActivityType,
  type EntityType,
} from '../db/schema/activity';

/**
 * Parameters for logging an activity
 */
export interface LogActivityParams {
  /** The entity type (project, ticket, client) */
  entityType: EntityType;
  /** The entity ID */
  entityId: string;
  /** The user ID who performed the action */
  actorId: string;
  /** The type of activity */
  type: ActivityType;
  /** Optional metadata with additional details */
  metadata?: ActivityMetadata;
  /** Optional project ID for backward compatibility */
  projectId?: string;
}

/**
 * Log an activity to the unified activity table
 *
 * @param params - Activity parameters
 * @returns The created activity record
 *
 * @example
 * // Log a project creation
 * await logActivity({
 *   entityType: 'project',
 *   entityId: projectId,
 *   actorId: userId,
 *   type: 'created',
 *   metadata: { name: 'New Project' }
 * });
 *
 * @example
 * // Log a status change with old/new values
 * await logActivity({
 *   entityType: 'ticket',
 *   entityId: ticketId,
 *   actorId: userId,
 *   type: 'status_changed',
 *   metadata: {
 *     field: 'status',
 *     oldValue: 'open',
 *     newValue: 'in_progress'
 *   }
 * });
 *
 * @example
 * // Log a bulk operation
 * await logActivity({
 *   entityType: 'ticket',
 *   entityId: 'bulk',
 *   actorId: userId,
 *   type: 'bulk_status_changed',
 *   metadata: {
 *     affectedIds: ['id1', 'id2', 'id3'],
 *     affectedCount: 3,
 *     field: 'status',
 *     newValue: 'closed'
 *   }
 * });
 */
export async function logActivity(params: LogActivityParams) {
  const { entityType, entityId, actorId, type, metadata, projectId } = params;

  const activityRecord = await db
    .insert(activity)
    .values({
      id: nanoid(),
      entityType,
      entityId,
      actorId,
      type,
      metadata: metadata ?? null,
      // Set projectId for backward compatibility when entityType is 'project'
      projectId: projectId ?? (entityType === 'project' ? entityId : null),
    })
    .returning();

  return activityRecord[0];
}

/**
 * Log a CRUD operation with automatic change detection
 *
 * @param params - Base activity parameters
 * @param oldValues - Previous values of the entity
 * @param newValues - New values of the entity
 * @returns The created activity record
 */
export async function logEntityChange<T extends Record<string, unknown>>(
  params: Omit<LogActivityParams, 'metadata' | 'type'>,
  oldValues: Partial<T> | null,
  newValues: Partial<T>,
  type?: ActivityType
) {
  // Determine activity type based on old/new values
  let activityType: ActivityType = type ?? 'updated';
  if (!oldValues) {
    activityType = 'created';
  }

  // Calculate changes
  const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

  if (oldValues) {
    for (const key of Object.keys(newValues)) {
      const oldVal = oldValues[key];
      const newVal = newValues[key];

      // Only log if value actually changed
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal ?? null,
          newValue: newVal ?? null,
        });
      }
    }
  }

  const metadata: ActivityMetadata = {
    changes: changes.length > 0 ? changes : undefined,
  };

  // If only one field changed, also set the simple field/oldValue/newValue
  if (changes.length === 1) {
    const change = changes[0];
    if (change) {
      metadata.field = change.field;
      metadata.oldValue = change.oldValue as ActivityMetadata['oldValue'];
      metadata.newValue = change.newValue as ActivityMetadata['newValue'];
    }
  }

  return logActivity({
    ...params,
    type: activityType,
    metadata,
  });
}

/**
 * Log a bulk operation
 *
 * @param params - Activity parameters including affected IDs
 * @returns The created activity record
 */
export async function logBulkOperation(
  params: Omit<LogActivityParams, 'entityId'> & {
    affectedIds: string[];
    description?: string;
  }
) {
  const { affectedIds, description, ...rest } = params;

  return logActivity({
    ...rest,
    entityId: 'bulk',
    metadata: {
      affectedIds,
      affectedCount: affectedIds.length,
      description,
    },
  });
}

/**
 * Common activity types for convenience
 */
export const ActivityTypes = {
  // CRUD operations
  CREATED: 'created' as const,
  UPDATED: 'updated' as const,
  DELETED: 'deleted' as const,
  ARCHIVED: 'archived' as const,
  RESTORED: 'restored' as const,

  // Field changes
  STATUS_CHANGED: 'status_changed' as const,
  PRIORITY_CHANGED: 'priority_changed' as const,
  DUE_DATE_CHANGED: 'due_date_changed' as const,

  // Assignments
  ASSIGNED: 'assigned' as const,
  UNASSIGNED: 'unassigned' as const,
  ASSIGNEE_ADDED: 'assignee_added' as const,
  ASSIGNEE_REMOVED: 'assignee_removed' as const,

  // Comments and files
  COMMENT_ADDED: 'comment_added' as const,
  FILE_UPLOADED: 'file_uploaded' as const,
  FILE_DELETED: 'file_deleted' as const,

  // Bulk operations
  BULK_STATUS_CHANGED: 'bulk_status_changed' as const,
  BULK_ASSIGNED: 'bulk_assigned' as const,
  BULK_DELETED: 'bulk_deleted' as const,
} as const;

/**
 * Entity types for convenience
 */
export const EntityTypes = {
  PROJECT: 'project' as const,
  TICKET: 'ticket' as const,
  CLIENT: 'client' as const,
} as const;
