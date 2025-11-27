import { useState, useCallback, useTransition } from 'react';

import { transformNotifications } from '@/components/default/dashboard/business-center/overview/utils/notification-transformers';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/lib/actions/notifications';
import { useRealtimeActivity } from '@/lib/hooks/use-socket';

import type {
  APINotification,
  DisplayNotification,
} from '@/components/default/dashboard/business-center/overview/types';

interface UseNotificationsOptions {
  readonly initialNotifications?: readonly APINotification[];
}

interface UseNotificationsReturn {
  readonly notifications: readonly DisplayNotification[];
  readonly isConnected: boolean;
  readonly isPending: boolean;
  readonly isEmpty: boolean;
  readonly markAsRead: (id: string) => void;
  readonly markAllAsRead: () => void;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { initialNotifications = [] } = options;
  const { isConnected } = useRealtimeActivity();
  const [isPending, startTransition] = useTransition();

  const [notifications, setNotifications] = useState<DisplayNotification[]>(() =>
    transformNotifications(initialNotifications)
  );

  const markAsRead = useCallback((id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    startTransition(async () => {
      const result = await markNotificationReadAction(id, true);
      if (!result.success) {
        // Revert on error
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      }
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.success) {
        // Revert on error - reload to get fresh data
        window.location.reload();
      }
    });
  }, []);

  return {
    notifications,
    isConnected,
    isPending,
    isEmpty: notifications.length === 0,
    markAsRead,
    markAllAsRead,
  };
}
