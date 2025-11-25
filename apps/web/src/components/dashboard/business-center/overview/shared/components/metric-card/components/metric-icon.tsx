import type { MetricIconProps } from '@/components/dashboard/business-center/overview/shared/components/metric-card/types';
import { METRIC_CARD_CLASSES } from '@/components/dashboard/business-center/overview/shared/components/metric-card/constants';

export function MetricIcon({ icon }: MetricIconProps) {
  return <div className={METRIC_CARD_CLASSES.ICON_WRAPPER}>{icon}</div>;
}
