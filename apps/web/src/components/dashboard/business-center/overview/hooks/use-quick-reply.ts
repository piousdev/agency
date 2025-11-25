import { useState, useCallback, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { quickReplyAction } from '@/lib/actions/comments';
import { extractEntityIdFromUrl } from '@/components/dashboard/business-center/overview/utils/notification';
import type { DisplayNotification } from '@/components/dashboard/business-center/overview/types';

interface UseQuickReplyOptions {
  readonly onSuccess?: (notificationId: string) => void;
}

interface UseQuickReplyReturn {
  readonly replyingTo: string | null;
  readonly replyText: string;
  readonly setReplyText: (text: string) => void;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly isPending: boolean;
  readonly startReply: (notificationId: string) => void;
  readonly cancelReply: () => void;
  readonly sendReply: (notification: DisplayNotification) => Promise<void>;
}

export function useQuickReply(options: UseQuickReplyOptions = {}): UseQuickReplyReturn {
  const { onSuccess } = options;
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  const startReply = useCallback((notificationId: string) => {
    setReplyingTo(notificationId);
    setReplyText('');
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyText('');
  }, []);

  const sendReply = useCallback(
    async (notification: DisplayNotification) => {
      if (!replyText.trim()) return;

      const entityType = notification.context?.type;
      const entityId = extractEntityIdFromUrl(notification.context?.url);

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
          onSuccess?.(notification.id);
        } else {
          toast.error(result.error || 'Failed to send reply');
        }
      });
    },
    [replyText, onSuccess]
  );

  return {
    replyingTo,
    replyText,
    setReplyText,
    inputRef,
    isPending,
    startReply,
    cancelReply,
    sendReply,
  };
}
