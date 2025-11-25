import { NOTIFICATION_TYPE_CONFIG } from '@/components/dashboard/business-center/overview/constants/notification-config';
import type {
  DisplayNotificationType,
  NotificationTypeConfig,
} from '@/components/dashboard/business-center/overview/types';

const INITIALS_MAX_LENGTH = 2;

/**
 * Formats a timestamp to relative time.
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';

  return `${diffDays}d ago`;
}

/**
 * Extracts initials from a name.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return '';

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, INITIALS_MAX_LENGTH);
}

/**
 * Gets notification type config.
 */
export function getNotificationTypeConfig(type: DisplayNotificationType): NotificationTypeConfig {
  return NOTIFICATION_TYPE_CONFIG[type];
}

/**
 * Extracts entity ID from action URL.
 */
export function extractEntityIdFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.split('/').pop();
}

/**
 * Checks if notification can have replies (not comment type).
 */
export function canReplyToNotification(contextType: string | undefined): boolean {
  return contextType !== 'comment' && contextType !== undefined;
}
