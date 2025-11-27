'use client';

import * as React from 'react';

import Link from 'next/link';

import {
  IconBell,
  IconCheck,
  IconChecks,
  IconFilter,
  IconLoader2,
  IconX,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications';
import { cn } from '@/lib/utils';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${String(days)}d ago`;
}

function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTimeAgo(formatTimeAgo(date));
    // Update time ago every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  if (!timeAgo) return null;

  return timeAgo;
}

// Map notification types to display colors
function getNotificationTypeColor(type: Notification['type']): string {
  switch (type) {
    case 'mention':
    case 'comment':
    case 'reply':
      return 'bg-blue-500';
    case 'assignment':
      return 'bg-green-500';
    case 'unassignment':
      return 'bg-orange-500';
    case 'status_change':
    case 'project_update':
      return 'bg-purple-500';
    case 'due_date_reminder':
      return 'bg-yellow-500';
    case 'overdue':
      return 'bg-red-500';
    case 'system':
    default:
      return 'bg-gray-500';
  }
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="flex-1 space-y-1">
      <p className="text-sm font-medium leading-none">{notification.title}</p>
      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
      <p className="text-xs text-muted-foreground">
        <TimeAgo date={notification.createdAt} />
      </p>
    </div>
  );
}

export function Notifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications({ pageSize: 20 });
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full cursor-pointer"
          aria-label="Notifications"
        >
          <IconBell className="size-[1.2rem] text-primary" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <IconBell className="size-4" />
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <IconFilter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>Unread only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {unreadCount > 0 && (
              <Button variant="ghost" size="icon-sm" onClick={markAllAsRead}>
                <IconChecks className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconLoader2 className="mb-2 size-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IconBell className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'group relative flex gap-3 px-4 py-3 transition-colors hover:bg-accent',
                    !notification.read && 'bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'mt-1 size-2 shrink-0 rounded-full',
                      !notification.read && getNotificationTypeColor(notification.type),
                      notification.read && 'bg-transparent'
                    )}
                  />
                  {notification.actionUrl ? (
                    <Link
                      href={notification.actionUrl}
                      className="flex-1 cursor-pointer"
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <NotificationContent notification={notification} />
                  )}
                  <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => markAsRead(notification.id)}
                        aria-label="Mark as read"
                      >
                        <IconCheck className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteNotification(notification.id)}
                      aria-label="Delete notification"
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
