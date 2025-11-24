import { z } from 'zod';

/**
 * Query parameters schema for listing notifications
 */
export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: z
    .enum([
      'mention',
      'comment',
      'reply',
      'assignment',
      'unassignment',
      'status_change',
      'due_date_reminder',
      'overdue',
      'project_update',
      'system',
    ])
    .optional(),
  unreadOnly: z.coerce.boolean().optional().default(false),
  entityType: z.enum(['ticket', 'project', 'comment', 'client', 'sprint', 'milestone']).optional(),
});

/**
 * Schema for marking a single notification as read
 */
export const markNotificationReadSchema = z.object({
  read: z.boolean(),
});

/**
 * Schema for marking multiple notifications as read
 */
export const markAllNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(), // If not provided, mark all as read
});

/**
 * Schema for snoozing a notification
 */
export const snoozeNotificationSchema = z.object({
  snoozedUntil: z.string().datetime(), // ISO 8601 datetime string
});
