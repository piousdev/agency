'use client';

import { cn } from '@/lib/utils';
import type { StatusLabelProps } from '@/components/dashboard/business-center/overview/shared/components/connection-status/types';
import { CONNECTION_STATUS_CLASSES } from '@/components/dashboard/business-center/overview/shared/components/connection-status/constants';

export function StatusLabel({ label, color }: StatusLabelProps) {
  return <span className={cn(CONNECTION_STATUS_CLASSES.LABEL, color)}>{label}</span>;
}
