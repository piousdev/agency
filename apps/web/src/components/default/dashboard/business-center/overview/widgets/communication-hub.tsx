'use client';

import { memo } from 'react';

import { HubActions } from '@/components/default/dashboard/business-center/overview/components/hub-actions';
import { HubEmptyState } from '@/components/default/dashboard/business-center/overview/components/hub-empty-state';
import { HubHeader } from '@/components/default/dashboard/business-center/overview/components/hub-header';
import { NotificationItem } from '@/components/default/dashboard/business-center/overview/components/hub-item';
import {
  useNotifications,
  useNotificationFilter,
  useQuickReply,
} from '@/components/default/dashboard/business-center/overview/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { APINotification } from '@/components/default/dashboard/business-center/overview/types';

export interface CommunicationHubWidgetProps {
  readonly className?: string;
  readonly initialNotifications?: readonly APINotification[];
  readonly initialUnreadCount?: number;
}

export const CommunicationHubWidget = memo(function CommunicationHubWidget({
  className,
  initialNotifications = [],
  initialUnreadCount: _initialUnreadCount = 0,
}: CommunicationHubWidgetProps) {
  const { notifications, isConnected, isPending, isEmpty, markAsRead, markAllAsRead } =
    useNotifications({ initialNotifications });

  const { activeTab, setActiveTab, filteredNotifications, counts } = useNotificationFilter({
    notifications,
  });

  const {
    replyingTo,
    replyText,
    setReplyText,
    inputRef,
    isPending: isReplyPending,
    startReply,
    cancelReply,
    sendReply,
  } = useQuickReply({
    onSuccess: markAsRead,
  });

  const combinedPending = isPending || isReplyPending;

  if (isEmpty) {
    return <HubEmptyState isConnected={isConnected} className={className} />;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <HubHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={counts.unread}
        unreadMentions={counts.unreadMentions}
        isPending={combinedPending}
        onMarkAllRead={markAllAsRead}
      />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              replyingTo={replyingTo}
              replyText={replyText}
              replyInputRef={inputRef}
              isPending={combinedPending}
              onSetReplyText={setReplyText}
              onStartReply={startReply}
              onCancelReply={cancelReply}
              onSendReply={sendReply}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      </ScrollArea>

      <HubActions />
    </div>
  );
});
