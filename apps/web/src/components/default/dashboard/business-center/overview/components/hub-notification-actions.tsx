import { memo } from 'react';

import { IconArrowBackUp, IconCheck } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

interface NotificationActionsProps {
  readonly notificationId: string;
  readonly isRead: boolean;
  readonly canReply: boolean;
  readonly isReplying: boolean;
  readonly isPending: boolean;
  readonly onReply: (id: string) => void;
  readonly onMarkRead: (id: string) => void;
}

export const NotificationActions = memo(function NotificationActions({
  notificationId,
  isRead,
  canReply,
  isReplying,
  isPending,
  onReply,
  onMarkRead,
}: NotificationActionsProps) {
  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply(notificationId);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkRead(notificationId);
  };

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {canReply && !isReplying && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={isPending}
          onClick={handleReply}
        >
          <IconArrowBackUp className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Reply</span>
        </Button>
      )}
      {!isRead && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={isPending}
          onClick={handleMarkRead}
        >
          <IconCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Mark as read</span>
        </Button>
      )}
    </div>
  );
});
