// components/connection-status/connection-dot.tsx
'use client';

import { CONNECTION_STATUS_CLASSES } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/constants';
import { getDotColor } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/utils';
import { useConnectionStatus } from '@/lib/hooks/use-socket';
import { cn } from '@/lib/utils';

import type { ConnectionDotProps } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/types';

export function ConnectionDot({ className }: ConnectionDotProps) {
  const { isConnected, isConnecting, isError } = useConnectionStatus();
  const dotColor = getDotColor(isConnected, isConnecting, isError);

  return (
    <span className={cn(CONNECTION_STATUS_CLASSES.DOT, dotColor, className)} aria-hidden="true" />
  );
}
