'use client';

import { CONNECTION_STATUS_CLASSES } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/constants';
import { cn } from '@/lib/utils';

import type { StatusIconProps } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/types';

export function StatusIcon({ icon: Icon, color, isAnimating = false }: StatusIconProps) {
  return (
    <Icon className={cn(CONNECTION_STATUS_CLASSES.ICON, color, isAnimating && 'animate-spin')} />
  );
}
