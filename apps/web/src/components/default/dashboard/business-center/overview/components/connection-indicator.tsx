import { memo } from 'react';

import { ConnectionDot } from '@/components/default/dashboard/business-center/overview/shared';

interface ConnectionIndicatorProps {
  readonly isConnected: boolean;
  readonly newCount: number;
}

export const ConnectionIndicator = memo(function ConnectionIndicator({
  isConnected,
  newCount,
}: ConnectionIndicatorProps) {
  const showNewCount = isConnected && newCount > 0;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ConnectionDot />
      {showNewCount && <span>{newCount} new</span>}
    </div>
  );
});
