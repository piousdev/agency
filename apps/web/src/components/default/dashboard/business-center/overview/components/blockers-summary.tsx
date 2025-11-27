import { memo } from 'react';

import { IconExclamationCircle } from '@tabler/icons-react';

interface BlockersSummaryProps {
  readonly count: number;
}

export const BlockersSummary = memo(function BlockersSummary({ count }: BlockersSummaryProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
        <IconExclamationCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-xs text-muted-foreground">Active blocker{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
});
