import type {
  APINotification,
  APINotificationType,
  DisplayNotification,
  DisplayNotificationType,
  ContextType,
} from '@/components/default/dashboard/business-center/overview/types';

/**
 * Maps API notification type to display type.
 */
export function mapNotificationType(apiType: APINotificationType): DisplayNotificationType {
  switch (apiType) {
    case 'mention':
      return 'mention';
    case 'comment':
      return 'comment';
    case 'reply':
      return 'reply';
    case 'assignment':
    case 'unassignment':
      return 'assignment';
    default:
      return 'update';
  }
}

/**
 * Maps entity type to context type.
 */
export function mapEntityType(entityType?: string | null): ContextType {
  switch (entityType) {
    case 'ticket':
      return 'ticket';
    case 'project':
      return 'project';
    case 'comment':
      return 'comment';
    default:
      return 'ticket';
  }
}

/**
 * Transforms API notification to display format.
 */
export function transformNotification(notification: APINotification): DisplayNotification {
  return {
    id: notification.id,
    type: mapNotificationType(notification.type),
    title: notification.title,
    message: notification.message,
    timestamp: notification.createdAt,
    read: notification.read,
    sender: {
      name: notification.sender?.name ?? 'System',
      image: notification.sender?.image ?? undefined,
    },
    context: notification.entityId
      ? {
          type: mapEntityType(notification.entityType),
          name: notification.metadata?.entityName ?? notification.metadata?.ticketTitle ?? 'View',
          url: notification.actionUrl ?? undefined,
        }
      : undefined,
  };
}

/**
 * Transforms multiple API notifications.
 */
export function transformNotifications(
  notifications: readonly APINotification[]
): DisplayNotification[] {
  return notifications.map(transformNotification);
}
