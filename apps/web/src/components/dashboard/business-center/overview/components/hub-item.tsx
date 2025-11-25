import { memo, type RefObject } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getInitials,
  formatRelativeTime,
  getNotificationTypeConfig,
  canReplyToNotification,
} from '@/components/dashboard/business-center/overview/utils/notification';
import { NotificationActions } from '@/components/dashboard/business-center/overview/components/hub-notification-actions';
import { QuickReplyInput } from '@/components/dashboard/business-center/overview/components/hub-quick-reply-input';
import type { DisplayNotification } from '@/components/dashboard/business-center/overview/types';

interface NotificationItemProps {
  readonly notification: DisplayNotification;
  readonly replyingTo: string | null;
  readonly replyText: string;
  readonly replyInputRef: RefObject<HTMLInputElement>;
  readonly isPending: boolean;
  readonly onSetReplyText: (text: string) => void;
  readonly onStartReply: (id: string) => void;
  readonly onCancelReply: () => void;
  readonly onSendReply: (notification: DisplayNotification) => void;
  readonly onMarkAsRead: (id: string) => void;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  replyingTo,
  replyText,
  replyInputRef,
  isPending,
  onSetReplyText,
  onStartReply,
  onCancelReply,
  onSendReply,
  onMarkAsRead,
}: NotificationItemProps) {
  const config = getNotificationTypeConfig(notification.type);
  const Icon = config.icon;
  const isReplying = replyingTo === notification.id;
  const canReply = canReplyToNotification(notification.context?.type);

  const handleClick = () => onMarkAsRead(notification.id);
  const handleSendReply = () => onSendReply(notification);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors cursor-pointer group',
        notification.read
          ? 'bg-background hover:bg-muted/50'
          : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={notification.sender.image} alt={notification.sender.name} />
          <AvatarFallback className="text-xs">
            {getInitials(notification.sender.name)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{notification.sender.name}</span>
            <div className={cn('p-1 rounded', config.colorClass)}>
              <Icon className="h-3 w-3" aria-hidden="true" />
            </div>
            {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>

          {/* Context */}
          {notification.context && (
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-xs font-normal">
                {notification.context.name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(notification.timestamp)}
              </span>
            </div>
          )}

          {/* Quick Reply Input */}
          {isReplying && (
            <QuickReplyInput
              inputRef={replyInputRef}
              value={replyText}
              onChange={onSetReplyText}
              onSend={handleSendReply}
              onCancel={onCancelReply}
              isPending={isPending}
            />
          )}
        </div>

        {/* Actions */}
        <NotificationActions
          notificationId={notification.id}
          isRead={notification.read}
          canReply={canReply}
          isReplying={isReplying}
          isPending={isPending}
          onReply={onStartReply}
          onMarkRead={onMarkAsRead}
        />
      </div>
    </div>
  );
});
