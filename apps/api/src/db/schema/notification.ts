import { boolean, index, pgEnum, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { user } from './user';

/**
 * Notification types for the communication hub
 */
export const notificationTypeEnum = pgEnum('notification_type', [
  'mention', // User was mentioned in a comment
  'comment', // New comment on watched item
  'reply', // Reply to user's comment
  'assignment', // Task assigned to user
  'unassignment', // Task unassigned from user
  'status_change', // Status changed on watched item
  'due_date_reminder', // Due date approaching
  'overdue', // Item is overdue
  'project_update', // Project update notification
  'system', // System notification
]);

/**
 * Entity type that notification relates to
 */
export const notificationEntityTypeEnum = pgEnum('notification_entity_type', [
  'ticket',
  'project',
  'comment',
  'client',
  'sprint',
  'milestone',
]);

/**
 * Metadata structure for notification records
 */
export interface NotificationMetadata {
  // Related entity info
  entityName?: string;
  entityUrl?: string;

  // Mention context
  mentionText?: string;
  commentPreview?: string;

  // Assignment context
  assignedBy?: string;

  // Due date context
  dueDate?: string;
  daysUntilDue?: number;

  // Additional context
  projectName?: string;
  ticketTitle?: string;

  // Any additional data
  [key: string]: unknown;
}

/**
 * Notification table for user notifications
 */
export const notification = pgTable(
  'notification',
  {
    id: text('id').primaryKey(),

    // Recipient of the notification
    recipientId: text('recipient_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Sender (who triggered the notification, optional for system notifications)
    senderId: text('sender_id').references(() => user.id, { onDelete: 'set null' }),

    // Type of notification
    type: notificationTypeEnum('type').notNull(),

    // Related entity
    entityType: notificationEntityTypeEnum('entity_type'),
    entityId: text('entity_id'),

    // Notification content
    title: text('title').notNull(),
    message: text('message').notNull(),

    // Action URL for clicking the notification
    actionUrl: text('action_url'),

    // Read/unread status
    read: boolean('read').default(false).notNull(),

    // Snoozed until (for dismissing temporarily)
    snoozedUntil: timestamp('snoozed_until'),

    // Flexible metadata
    metadata: jsonb('metadata').$type<NotificationMetadata>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Index on recipient for fetching user's notifications
    index('notification_recipient_id_idx').on(table.recipientId),

    // Index for unread notifications
    index('notification_recipient_read_idx').on(table.recipientId, table.read),

    // Index on sender
    index('notification_sender_id_idx').on(table.senderId),

    // Index on entity for grouping
    index('notification_entity_idx').on(table.entityType, table.entityId),

    // Index on type for filtering
    index('notification_type_idx').on(table.type),

    // Composite index for fetching user's notification feed
    index('notification_recipient_created_idx').on(table.recipientId, table.createdAt),

    // BRIN index on timestamp
    index('notification_created_at_idx').using('brin', table.createdAt),
  ]
);

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationEntityType = (typeof notificationEntityTypeEnum.enumValues)[number];
