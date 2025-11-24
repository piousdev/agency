'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineDataPoint {
  value: number;
  label?: string;
}

interface SparklineChartProps {
  data: SparklineDataPoint[];
  color?: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'primary';
  height?: number;
  showTooltip?: boolean;
  showArea?: boolean;
  className?: string;
}

/**
 * Sparkline chart for trend visualization
 * Compact inline chart suitable for widgets
 * Uses chart color tokens for consistent styling
 */
export function SparklineChart({
  data,
  color = 'chart-1',
  height = 40,
  showTooltip = true,
  showArea = true,
  className,
}: SparklineChartProps) {
  // Use chart-specific color tokens for graphs
  const colors = {
    'chart-1': {
      stroke: 'var(--color-chart-1)',
      fill: 'color-mix(in oklch, var(--color-chart-1), transparent 90%)',
    },
    'chart-2': {
      stroke: 'var(--color-chart-2)',
      fill: 'color-mix(in oklch, var(--color-chart-2), transparent 90%)',
    },
    'chart-3': {
      stroke: 'var(--color-chart-3)',
      fill: 'color-mix(in oklch, var(--color-chart-3), transparent 90%)',
    },
    'chart-4': {
      stroke: 'var(--color-chart-4)',
      fill: 'color-mix(in oklch, var(--color-chart-4), transparent 90%)',
    },
    'chart-5': {
      stroke: 'var(--color-chart-5)',
      fill: 'color-mix(in oklch, var(--color-chart-5), transparent 90%)',
    },
    primary: {
      stroke: 'hsl(var(--primary))',
      fill: 'hsl(var(--primary) / 0.1)',
    },
  };

  const chartColor = colors[color];

  // Add index for x-axis if not present
  const chartData = data.map((d, i) => ({
    ...d,
    index: i,
  }));

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelFormatter={(index) => chartData[index]?.label || `Point ${index + 1}`}
              formatter={(value: number) => [value, 'Value']}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor.stroke}
            strokeWidth={2}
            fill={showArea ? `url(#gradient-${color})` : 'transparent'}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Mini bar chart variant for sparkline
 */
export function MiniBarChart({
  data,
  color = 'chart-1',
  height = 40,
  className,
}: {
  data: { value: number; label?: string }[];
  color?: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5';
  height?: number;
  className?: string;
}) {
  // Use chart color tokens for consistent styling
  const colors = {
    'chart-1': 'bg-[var(--color-chart-1)]',
    'chart-2': 'bg-[var(--color-chart-2)]',
    'chart-3': 'bg-[var(--color-chart-3)]',
    'chart-4': 'bg-[var(--color-chart-4)]',
    'chart-5': 'bg-[var(--color-chart-5)]',
  };

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn('flex items-end gap-1', className)} style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-t', colors[color])}
          style={{ height: `${(d.value / max) * 100}%`, minHeight: 2 }}
          title={d.label || `${d.value}`}
        />
      ))}
    </div>
  );
}
