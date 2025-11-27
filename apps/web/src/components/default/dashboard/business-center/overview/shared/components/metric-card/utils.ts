import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';

import {
  SIZE_CLASSES,
  VALUE_SIZE_CLASSES,
  TREND_COLORS,
} from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/constants';

import type {
  TrendDirection,
  MetricCardSize,
} from '@/components/default/dashboard/business-center/overview/shared/components/metric-card/types';
import type { ComponentType } from 'react';

export const getTrendIcon = (trend: TrendDirection): ComponentType<{ className?: string }> => {
  const icons = {
    up: IconTrendingUp,
    down: IconTrendingDown,
    stable: IconMinus,
  } as const;

  return icons[trend];
};

export const getTrendColor = (trend: TrendDirection): string => {
  return TREND_COLORS[trend];
};

export const getSizeClasses = (size: MetricCardSize): string => {
  return SIZE_CLASSES[size];
};

export const getValueSizeClasses = (size: MetricCardSize): string => {
  return VALUE_SIZE_CLASSES[size];
};

export const formatChangeValue = (change: number): string => {
  return `${change > 0 ? '+' : ''}${String(change)}%`;
};

export const shouldShowTrend = (change?: number, trend?: TrendDirection): boolean => {
  return change !== undefined || trend !== undefined;
};
