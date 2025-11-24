'use client';

import { useConnectionStatus } from '@/lib/hooks/use-socket';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IconWifi, IconWifiOff, IconLoader2 } from '@tabler/icons-react';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Connection status indicator showing real-time socket connection state
 */
export function ConnectionStatus({ className, showLabel = false }: ConnectionStatusProps) {
  const { state, isConnected, isConnecting } = useConnectionStatus();

  const statusConfig = {
    connected: {
      icon: IconWifi,
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Connected',
      description: 'Real-time updates active',
    },
    connecting: {
      icon: IconLoader2,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      label: 'Connecting',
      description: 'Establishing connection...',
    },
    disconnected: {
      icon: IconWifiOff,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Offline',
      description: 'Real-time updates unavailable',
    },
    error: {
      icon: IconWifiOff,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      label: 'Connection Error',
      description: 'Failed to connect. Retrying...',
    },
  };

  const config = statusConfig[state];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
              config.bgColor,
              className
            )}
            role="status"
            aria-live="polite"
            aria-label={`Connection status: ${config.label}`}
          >
            <Icon className={cn('h-3.5 w-3.5', config.color, isConnecting && 'animate-spin')} />
            {showLabel && <span className={cn('font-medium', config.color)}>{config.label}</span>}
            {/* Pulse indicator for connected state */}
            {isConnected && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact connection dot indicator for space-constrained areas
 */
export function ConnectionDot({ className }: { className?: string }) {
  const { isConnected, isConnecting, isError } = useConnectionStatus();

  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        isConnected && 'bg-success',
        isConnecting && 'bg-warning animate-pulse',
        isError && 'bg-destructive',
        !isConnected && !isConnecting && !isError && 'bg-muted-foreground',
        className
      )}
      aria-hidden="true"
    />
  );
}
