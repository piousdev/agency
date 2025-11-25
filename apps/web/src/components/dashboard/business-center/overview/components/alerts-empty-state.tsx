import { memo } from 'react';
import { IconBellOff, IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ConnectionDot } from '@/components/dashboard/business-center/overview/shared';

interface AlertsEmptyStateProps {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly className?: string;
}

export const AlertsEmptyState = memo(function AlertsEmptyState({
  isConnected,
  isConnecting,
  className,
}: AlertsEmptyStateProps) {
  // Connecting state
  if (isConnecting) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconBellOff className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
        <p className="font-medium">Real-time Alerts</p>
        <p className="text-sm text-muted-foreground mt-1">Connecting to real-time updates...</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <ConnectionDot />
          <span>Connecting...</span>
        </div>
      </div>
    );
  }

  // All clear state (connected, no alerts)
  return (
    <div className={cn('flex flex-col items-center justify-center h-full text-center', className)}>
      <IconCheck className="h-8 w-8 text-success mb-2" aria-hidden="true" />
      <p className="font-medium">All Clear</p>
      <p className="text-sm text-muted-foreground mt-1">No active alerts</p>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
        <ConnectionDot />
        <span>Monitoring for new alerts</span>
      </div>
    </div>
  );
});
