'use client';

import { CONNECTION_STATUS_CLASSES } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/constants';

import type { PulseIndicatorProps } from '@/components/default/dashboard/business-center/overview/shared/components/connection-status/types';

export function PulseIndicator({ show }: PulseIndicatorProps) {
  if (!show) return null;

  return (
    <span className={CONNECTION_STATUS_CLASSES.PULSE_CONTAINER}>
      <span className={CONNECTION_STATUS_CLASSES.PULSE_RING} />
      <span className={CONNECTION_STATUS_CLASSES.PULSE_DOT} />
    </span>
  );
}
