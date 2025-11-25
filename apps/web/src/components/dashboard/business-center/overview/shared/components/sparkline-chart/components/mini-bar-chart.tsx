// components/sparkline-chart/mini-bar-chart.tsx
'use client';

import { cn } from '@/lib/utils';
import type { MiniBarChartProps } from '@/components/dashboard/business-center/overview/shared/components/sparkline-chart/types';
import {
  BAR_CHART_COLORS,
  CHART_DEFAULTS,
} from '@/components/dashboard/business-center/overview/shared/components/sparkline-chart/constants';
import {
  getMaxValue,
  calculateBarHeight,
} from '@/components/dashboard/business-center/overview/shared/components/sparkline-chart/utils';

export function MiniBarChart({
  data,
  color = CHART_DEFAULTS.COLOR,
  height = CHART_DEFAULTS.HEIGHT,
  className,
}: MiniBarChartProps) {
  const max = getMaxValue(data);
  const barColor = BAR_CHART_COLORS[color];

  return (
    <div className={cn('flex items-end gap-1', className)} style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-t', barColor)}
          style={{
            height: calculateBarHeight(d.value, max),
            minHeight: CHART_DEFAULTS.MIN_BAR_HEIGHT,
          }}
          title={d.label || `${d.value}`}
        />
      ))}
    </div>
  );
}
