// components/connection-status/connection-status.tsx
'use client';

import { useConnectionStatus } from '@/lib/hooks/use-socket';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ConnectionStatusProps } from '@/components/dashboard/business-center/overview/shared/components/connection-status/types';
import {
  CONNECTION_STATUS_CLASSES,
  CONNECTION_DEFAULTS,
} from '@/components/dashboard/business-center/overview/shared/components/connection-status/constants';
import {
  getStatusConfig,
  getAriaLabel,
} from '@/components/dashboard/business-center/overview/shared/components/connection-status/utils';
import { StatusIcon } from '@/components/dashboard/business-center/overview/shared/components/connection-status/components/status-icon';
import { StatusLabel } from '@/components/dashboard/business-center/overview/shared/components/connection-status/components/status-label';
import { PulseIndicator } from '@/components/dashboard/business-center/overview/shared/components/connection-status/components/pulse-indicator';
import { StatusTooltip } from '@/components/dashboard/business-center/overview/shared/components/connection-status/components/status-tooltip';

export function ConnectionStatus({
  className,
  showLabel = CONNECTION_DEFAULTS.SHOW_LABEL,
}: ConnectionStatusProps) {
  const { state, isConnected, isConnecting } = useConnectionStatus();
  const config = getStatusConfig(state);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(CONNECTION_STATUS_CLASSES.CONTAINER, config.bgColor, className)}
            role="status"
            aria-live="polite"
            aria-label={getAriaLabel(config.label)}
          >
            <StatusIcon icon={config.icon} color={config.color} isAnimating={isConnecting} />
            {showLabel && <StatusLabel label={config.label} color={config.color} />}
            <PulseIndicator show={isConnected} />
          </div>
        </TooltipTrigger>
        <StatusTooltip label={config.label} description={config.description} />
      </Tooltip>
    </TooltipProvider>
  );
}
