import { useState, useMemo, useCallback } from 'react';
import {
  isValidTabValue,
  type DisplayNotification,
  type TabValue,
} from '@/components/dashboard/business-center/overview/types';

interface UseNotificationFilterOptions {
  readonly notifications: readonly DisplayNotification[];
}

interface UseNotificationFilterReturn {
  readonly activeTab: TabValue;
  readonly setActiveTab: (tab: TabValue) => void;
  readonly filteredNotifications: readonly DisplayNotification[];
  readonly counts: {
    readonly unread: number;
    readonly unreadMentions: number;
  };
}

export function useNotificationFilter({
  notifications,
}: UseNotificationFilterOptions): UseNotificationFilterReturn {
  const [activeTab, setActiveTabInternal] = useState<TabValue>('all');

  const setActiveTab = useCallback((value: string) => {
    if (isValidTabValue(value)) {
      setActiveTabInternal(value);
    }
  }, []);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'mentions':
        return notifications.filter((n) => n.type === 'mention');
      case 'comments':
        return notifications.filter((n) => n.type === 'comment' || n.type === 'reply');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const counts = useMemo(
    () => ({
      unread: notifications.filter((n) => !n.read).length,
      unreadMentions: notifications.filter((n) => n.type === 'mention' && !n.read).length,
    }),
    [notifications]
  );

  return {
    activeTab,
    setActiveTab,
    filteredNotifications,
    counts,
  };
}
