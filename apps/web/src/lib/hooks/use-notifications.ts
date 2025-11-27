'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSocketStore } from '@/lib/hooks/use-socket';
import { getSocket, type NotificationPayload } from '@/lib/socket';

/**
 * Notification type matching the API response
 * Extends socket payload with additional API fields
 */
export interface Notification extends NotificationPayload {
  snoozedUntil?: string | null;
  sender?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  unreadCount: number;
}

interface UseNotificationsOptions {
  pageSize?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}

/**
 * Hook for fetching and managing user notifications
 * Integrates with both API and real-time socket updates
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { pageSize = 20, unreadOnly = false, enabled = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connectionState } = useSocketStore();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: '1',
        pageSize: pageSize.toString(),
        sortOrder: 'desc',
      });

      if (unreadOnly) {
        params.append('unreadOnly', 'true');
      }

      const response = await fetch(
        `${String(process.env.NEXT_PUBLIC_API_URL)}/api/notifications?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = (await response.json()) as NotificationsResponse;
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, pageSize, unreadOnly]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${String(process.env.NEXT_PUBLIC_API_URL)}/api/notifications/${id}/read`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ read: true }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `${String(process.env.NEXT_PUBLIC_API_URL)}/api/notifications/read-all`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${String(process.env.NEXT_PUBLIC_API_URL)}/api/notifications/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Clear all notifications (client-side only)
  const clearAll = useCallback(async () => {
    // Delete all notifications via API (could be batch in future)
    await Promise.all(notifications.map((n) => deleteNotification(n.id)));
    setNotifications([]);
    setUnreadCount(0);
  }, [notifications, deleteNotification]);

  // Initial fetch
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notification events via socket
  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    // Handle new notification from socket
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, pageSize));
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Handle notification read from another client
    const handleNotificationRead = (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    };

    // Register event listeners
    socket.on('notification', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
    };
  }, [enabled, pageSize]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected: connectionState === 'connected',
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetchNotifications,
  };
}
