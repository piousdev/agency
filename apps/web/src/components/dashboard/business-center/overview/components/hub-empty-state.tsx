import { memo } from 'react';
import { IconMessage } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ConnectionDot } from '@/components/dashboard/business-center/overview/shared';

interface HubEmptyStateProps {
  readonly isConnected: boolean;
  readonly className?: string;
}

export const HubEmptyState = memo(function HubEmptyState({
  isConnected,
  className,
}: HubEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full text-center', className)}>
      <IconMessage className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
      <p className="font-medium">All Caught Up</p>
      <p className="text-sm text-muted-foreground mt-1">No new messages or mentions</p>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
        <ConnectionDot />
        <span>{isConnected ? 'Listening for updates' : 'Connecting...'}</span>
      </div>
    </div>
  );
});
