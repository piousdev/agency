import { METRIC_CARD_CLASSES } from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/constants';

import type { MetricIconProps } from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/types';

export function MetricIcon({ icon }: MetricIconProps) {
  return <div className={METRIC_CARD_CLASSES.ICON_WRAPPER}>{icon}</div>;
}
