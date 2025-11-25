import { useCallback } from 'react';
import { toast } from 'sonner';
import { TOAST_MESSAGES } from '@/components/dashboard/business-center/overview/constants/blocker-config';
import type { BlockerItem } from '@/components/dashboard/business-center/overview/types';

interface UseBlockerActionsReturn {
  readonly escalate: (blocker: BlockerItem) => void;
  readonly resolve: (blocker: BlockerItem) => void;
}

export function useBlockerActions(): UseBlockerActionsReturn {
  const escalate = useCallback((blocker: BlockerItem) => {
    toast.warning(TOAST_MESSAGES.escalated(blocker.title), {
      description: TOAST_MESSAGES.escalatedDescription(blocker.projectName),
      action: {
        label: 'Undo',
        onClick: () => toast.info(TOAST_MESSAGES.escalationCancelled),
      },
    });
    // TODO: Implement actual escalation API call
  }, []);

  const resolve = useCallback((blocker: BlockerItem) => {
    toast.success(TOAST_MESSAGES.resolved(blocker.title), {
      description: TOAST_MESSAGES.resolvedDescription(blocker.daysBlocked),
    });
    // TODO: Implement actual resolution API call
  }, []);

  return { escalate, resolve };
}
