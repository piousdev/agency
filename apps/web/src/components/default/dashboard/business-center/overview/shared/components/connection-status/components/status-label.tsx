'use client';

import { CONNECTION_STATUS_CLASSES } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/constants';
import { cn } from '@/lib/utils';

import type { StatusLabelProps } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/types';

export function StatusLabel({ label, color }: StatusLabelProps) {
  return <span className={cn(CONNECTION_STATUS_CLASSES.LABEL, color)}>{label}</span>;
}
