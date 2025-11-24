'use client';

import { useState, useMemo, useCallback, useTransition, useRef } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  IconMessage,
  IconAt,
  IconBell,
  IconCheck,
  IconChecks,
  IconArrowRight,
  IconArrowBackUp,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRealtimeActivity } from '@/lib/hooks/use-socket';
import { ConnectionDot } from '../shared/connection-status';
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/lib/actions/notifications';
import { quickReplyAction } from '@/lib/actions/comments';
import type {
  Notification as APINotification,
  NotificationType as APINotificationType,
} from '@/lib/api/notifications';

type TabValue = 'all' | 'mentions' | 'comments';

// Mapped notification type for display
type DisplayNotificationType = 'mention' | 'comment' | 'reply' | 'assignment' | 'update';

interface DisplayNotification {
  id: string;
  type: DisplayNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender: {
    name: string;
    image?: string;
  };
  context?: {
    type: 'ticket' | 'project' | 'comment';
    name: string;
    url?: string;
  };
}

// Map API notification type to display type
function mapNotificationType(apiType: APINotificationType): DisplayNotificationType {
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

// Map entity type to context type
function mapEntityType(entityType?: string | null): 'ticket' | 'project' | 'comment' {
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

// Transform API notification to display format
function transformNotification(notification: APINotification): DisplayNotification {
  return {
    id: notification.id,
    type: mapNotificationType(notification.type),
    title: notification.title,
    message: notification.message,
    timestamp: notification.createdAt,
    read: notification.read,
    sender: {
      name: notification.sender?.name || 'System',
      image: notification.sender?.image || undefined,
    },
    context: notification.entityId
      ? {
          type: mapEntityType(notification.entityType),
          name: notification.metadata?.entityName || notification.metadata?.ticketTitle || 'View',
          url: notification.actionUrl || undefined,
        }
      : undefined,
  };
}

export interface CommunicationHubWidgetProps {
  className?: string;
  initialNotifications?: APINotification[];
  initialUnreadCount?: number;
}

export function CommunicationHubWidget({
  className,
  initialNotifications = [],
  initialUnreadCount = 0,
}: CommunicationHubWidgetProps) {
  const { isConnected } = useRealtimeActivity();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [isPending, startTransition] = useTransition();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Transform API notifications to display format
  const [notifications, setNotifications] = useState<DisplayNotification[]>(() =>
    initialNotifications.map(transformNotification)
  );

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'mentions') return notifications.filter((n) => n.type === 'mention');
    if (activeTab === 'comments')
      return notifications.filter((n) => n.type === 'comment' || n.type === 'reply');
    return notifications;
  }, [notifications, activeTab]);

  // Count unread
  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadMentions = notifications.filter((n) => n.type === 'mention' && !n.read).length;

  // Mark single as read
  const markAsRead = useCallback((id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    // Call server action
    startTransition(async () => {
      const result = await markNotificationReadAction(id, true);
      if (!result.success) {
        // Revert on error
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      }
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Call server action
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.success) {
        // Revert on error - reload page to get fresh data
        window.location.reload();
      }
    });
  }, []);

  // Start replying to a notification
  const startReply = useCallback((notificationId: string) => {
    setReplyingTo(notificationId);
    setReplyText('');
    // Focus input after state update
    setTimeout(() => replyInputRef.current?.focus(), 0);
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyText('');
  }, []);

  // Send quick reply
  const sendQuickReply = useCallback(
    async (notification: DisplayNotification) => {
      if (!replyText.trim()) return;

      const entityType = notification.context?.type;
      const entityId = notifications
        .find((n) => n.id === notification.id)
        ?.context?.url?.split('/')
        .pop();

      if (!entityType || entityType === 'comment' || !entityId) {
        toast.error('Cannot reply to this notification');
        return;
      }

      const entityTypeForApi = entityType === 'ticket' ? 'ticket' : 'project';

      startTransition(async () => {
        const result = await quickReplyAction(entityTypeForApi, entityId, replyText.trim());
        if (result.success) {
          toast.success('Reply sent');
          setReplyingTo(null);
          setReplyText('');
          // Mark as read after replying
          markAsRead(notification.id);
        } else {
          toast.error(result.error || 'Failed to send reply');
        }
      });
    },
    [replyText, notifications, markAsRead]
  );

  // Get icon for notification type
  const getIcon = (type: DisplayNotificationType) => {
    switch (type) {
      case 'mention':
        return IconAt;
      case 'comment':
        return IconMessage;
      case 'reply':
        return IconArrowBackUp;
      case 'assignment':
        return IconBell;
      default:
        return IconBell;
    }
  };

  // Get color for notification type
  const getColor = (type: DisplayNotificationType) => {
    switch (type) {
      case 'mention':
        return 'bg-primary/10 text-primary';
      case 'comment':
        return 'bg-accent/10 text-accent-foreground';
      case 'reply':
        return 'bg-success/10 text-success';
      case 'assignment':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (notifications.length === 0) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconMessage className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-medium">All Caught Up</p>
        <p className="text-sm text-muted-foreground mt-1">No new messages or mentions</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <ConnectionDot />
          <span>{isConnected ? 'Listening for updates' : 'Connecting...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with tabs and actions */}
      <div className="flex items-center justify-between mb-3">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="w-auto"
        >
          <TabsList className="h-7">
            <TabsTrigger value="all" className="text-xs px-2 h-6">
              All
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs px-2 h-6">
              <IconAt className="h-3 w-3 mr-1" />
              {unreadMentions > 0 && (
                <Badge variant="destructive" className="h-4 min-w-4 px-1 text-xs">
                  {unreadMentions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs px-2 h-6">
              <IconMessage className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <ConnectionDot />
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={markAllAsRead}
              disabled={isPending}
            >
              <IconChecks className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  'p-3 rounded-lg border transition-colors cursor-pointer group',
                  notification.read
                    ? 'bg-background hover:bg-muted/50'
                    : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={notification.sender.image} alt={notification.sender.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(notification.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{notification.sender.name}</span>
                      <div className={cn('p-1 rounded', getColor(notification.type))}>
                        <Icon className="h-3 w-3" />
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.context && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-xs font-normal">
                          {notification.context.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    )}
                    {/* Quick Reply Input */}
                    {replyingTo === notification.id && (
                      <div
                        className="flex items-center gap-2 mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          ref={replyInputRef}
                          type="text"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendQuickReply(notification);
                            } else if (e.key === 'Escape') {
                              cancelReply();
                            }
                          }}
                          className="h-7 text-xs flex-1"
                          disabled={isPending}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => sendQuickReply(notification)}
                          disabled={isPending || !replyText.trim()}
                        >
                          <IconSend className="h-3.5 w-3.5" />
                          <span className="sr-only">Send reply</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={cancelReply}
                          disabled={isPending}
                        >
                          <IconX className="h-3.5 w-3.5" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {/* Reply button - only for ticket/project notifications */}
                    {notification.context?.type !== 'comment' && replyingTo !== notification.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          startReply(notification.id);
                        }}
                      >
                        <IconArrowBackUp className="h-3.5 w-3.5" />
                        <span className="sr-only">Reply</span>
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <IconCheck className="h-3.5 w-3.5" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/collaboration/messages">
            View all messages
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
