'use client';

import { cn } from '@/lib/utils';
import type { StatusIconProps } from '@/components/dashboard/business-center/overview/shared/components/connection-status/types';
import { CONNECTION_STATUS_CLASSES } from '@/components/dashboard/business-center/overview/shared/components/connection-status/constants';

export function StatusIcon({ icon: Icon, color, isAnimating = false }: StatusIconProps) {
  return (
    <Icon className={cn(CONNECTION_STATUS_CLASSES.ICON, color, isAnimating && 'animate-spin')} />
  );
}
