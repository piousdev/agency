import { memo } from 'react';

import { IconArrowUp, IconCheck } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

import type { BlockerItem } from '../types';

interface BlockerActionsProps {
  readonly blocker: BlockerItem;
  readonly onEscalate: (blocker: BlockerItem) => void;
  readonly onResolve: (blocker: BlockerItem) => void;
}

export const BlockerActions = memo(function BlockerActions({
  blocker,
  onEscalate,
  onResolve,
}: BlockerActionsProps) {
  const handleEscalate = () => onEscalate(blocker);
  const handleResolve = () => onResolve(blocker);

  return (
    <div className="flex items-center gap-2 mt-2 ml-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleEscalate}>
        <IconArrowUp className="h-3 w-3 mr-1" aria-hidden="true" />
        Escalate
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-success hover:text-success hover:bg-success/10"
        onClick={handleResolve}
      >
        <IconCheck className="h-3 w-3 mr-1" aria-hidden="true" />
        Resolve
      </Button>
    </div>
  );
});
