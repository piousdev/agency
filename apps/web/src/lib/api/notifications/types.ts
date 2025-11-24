/**
 * TypeScript types for notification API operations
 */

export type NotificationType =
  | 'mention'
  | 'comment'
  | 'reply'
  | 'assignment'
  | 'unassignment'
  | 'status_change'
  | 'due_date_reminder'
  | 'overdue'
  | 'project_update'
  | 'system';

export type NotificationEntityType =
  | 'ticket'
  | 'project'
  | 'comment'
  | 'client'
  | 'sprint'
  | 'milestone';

export interface NotificationMetadata {
  entityName?: string;
  entityUrl?: string;
  mentionText?: string;
  commentPreview?: string;
  assignedBy?: string;
  dueDate?: string;
  daysUntilDue?: number;
  projectName?: string;
  ticketTitle?: string;
  [key: string]: unknown;
}

export interface NotificationSender {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string | null;
  type: NotificationType;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
  title: string;
  message: string;
  actionUrl?: string | null;
  read: boolean;
  snoozedUntil?: string | null;
  metadata?: NotificationMetadata | null;
  createdAt: string;
  updatedAt: string;
  sender?: NotificationSender | null;
}

export interface ListNotificationsParams {
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
  type?: NotificationType;
  unreadOnly?: boolean;
  entityType?: NotificationEntityType;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: PaginationInfo;
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkNotificationReadParams {
  read: boolean;
}

export interface MarkAllNotificationsReadParams {
  notificationIds?: string[];
}

export interface NotificationUpdateResponse {
  success: boolean;
  data?: Notification;
  updatedCount?: number;
}

export interface NotificationDeleteResponse {
  success: boolean;
  message: string;
}
