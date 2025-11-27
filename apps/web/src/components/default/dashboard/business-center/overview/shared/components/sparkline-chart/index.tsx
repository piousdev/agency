// components/sparkline-chart/sparkline-chart.tsx
'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  CHART_COLORS,
  CHART_DEFAULTS,
  CHART_MARGINS,
  TOOLTIP_STYLE,
  ACTIVE_DOT_CONFIG,
} from '@/components/default/dashboard/business-center/overview/shared/components/sparkline-chart/constants';
import {
  addIndexToData,
  formatTooltipLabel,
  formatTooltipValue,
} from '@/components/default/dashboard/business-center/overview/shared/components/sparkline-chart/utils';
import { cn } from '@/lib/utils';

import type { SparklineChartProps } from '@/components/default/dashboard/business-center/overview/shared/components/sparkline-chart/types';

export function SparklineChart({
  data,
  color = CHART_DEFAULTS.COLOR,
  height = CHART_DEFAULTS.HEIGHT,
  showTooltip = CHART_DEFAULTS.SHOW_TOOLTIP,
  showArea = CHART_DEFAULTS.SHOW_AREA,
  className,
}: SparklineChartProps) {
  const chartColor = CHART_COLORS[color];
  const chartData = addIndexToData(data);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={CHART_MARGINS}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor.fill} stopOpacity={1} />
              <stop offset="100%" stopColor={chartColor.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          {showTooltip && (
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelFormatter={(index) => formatTooltipLabel(index as number, chartData)}
              formatter={(value: number) => formatTooltipValue(value)}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor.stroke}
            strokeWidth={2}
            fill={showArea ? `url(#gradient-${color})` : 'transparent'}
            dot={false}
            activeDot={ACTIVE_DOT_CONFIG}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
