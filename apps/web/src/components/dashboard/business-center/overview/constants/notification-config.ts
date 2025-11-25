import { IconMessage, IconAt, IconBell, IconArrowBackUp } from '@tabler/icons-react';
import type {
  DisplayNotificationType,
  NotificationTypeConfig,
} from '@/components/dashboard/business-center/overview/types';

/**
 * Notification type visual configurations.
 */
export const NOTIFICATION_TYPE_CONFIG: Readonly<
  Record<DisplayNotificationType, NotificationTypeConfig>
> = {
  mention: {
    icon: IconAt,
    colorClass: 'bg-primary/10 text-primary',
  },
  comment: {
    icon: IconMessage,
    colorClass: 'bg-accent/10 text-accent-foreground',
  },
  reply: {
    icon: IconArrowBackUp,
    colorClass: 'bg-success/10 text-success',
  },
  assignment: {
    icon: IconBell,
    colorClass: 'bg-warning/10 text-warning',
  },
  update: {
    icon: IconBell,
    colorClass: 'bg-muted text-muted-foreground',
  },
} as const;

/**
 * Navigation URLs.
 */
export const HUB_URLS = {
  messages: '/dashboard/collaboration/messages',
} as const;

/**
 * Tab configurations.
 */
export const TAB_CONFIG: readonly {
  readonly value: TabValue;
  readonly label: string;
  readonly icon?: typeof IconAt;
}[] = [
  { value: 'all', label: 'All' },
  { value: 'mentions', label: '', icon: IconAt },
  { value: 'comments', label: '', icon: IconMessage },
] as const;

import type { TabValue } from '../types';
