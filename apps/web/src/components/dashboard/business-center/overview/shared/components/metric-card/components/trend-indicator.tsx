'use client';

import { cn } from '@/lib/utils';
import type { TrendIndicatorProps } from '@/components/dashboard/business-center/overview/shared/components/metric-card/types';
import { METRIC_CARD_CLASSES } from '@/components/dashboard/business-center/overview/shared/components/metric-card/constants';
import {
  getTrendIcon,
  getTrendColor,
  formatChangeValue,
  shouldShowTrend,
} from '@/components/dashboard/business-center/overview/shared/components/metric-card/utils';

export function TrendIndicator({ trend, change, changeLabel }: TrendIndicatorProps) {
  if (!shouldShowTrend(change, trend)) {
    return null;
  }

  const TrendIcon = trend ? getTrendIcon(trend) : null;
  const trendColor = trend ? getTrendColor(trend) : '';

  return (
    <div className={METRIC_CARD_CLASSES.TREND_CONTAINER}>
      {TrendIcon && <TrendIcon className={cn(METRIC_CARD_CLASSES.TREND_ICON, trendColor)} />}
      {change !== undefined && (
        <span className={cn(METRIC_CARD_CLASSES.CHANGE_TEXT, trend && trendColor)}>
          {formatChangeValue(change)}
        </span>
      )}
      {changeLabel && <span className={METRIC_CARD_CLASSES.CHANGE_LABEL}>{changeLabel}</span>}
    </div>
  );
}
