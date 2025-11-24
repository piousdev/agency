'use client';

import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type TrendDirection = 'up' | 'down' | 'stable';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Metric card component for KPI display
 * Shows value with optional trend indicator and icon
 */
export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  trend,
  icon,
  className,
  size = 'md',
}: MetricCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const TrendIcon =
    trend === 'up' ? IconTrendingUp : trend === 'down' ? IconTrendingDown : IconMinus;

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    stable: 'text-muted-foreground',
  };

  return (
    <div className={cn('rounded-lg border bg-card', sizeClasses[size], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('font-bold', valueSizes[size])}>{value}</p>
        </div>
        {icon && <div className="p-2 rounded-lg bg-muted">{icon}</div>}
      </div>

      {(change !== undefined || trend) && (
        <div className="flex items-center gap-1 mt-2">
          {trend && <TrendIcon className={cn('h-4 w-4', trendColors[trend])} />}
          {change !== undefined && (
            <span className={cn('text-sm font-medium', trend && trendColors[trend])}>
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          )}
          {changeLabel && <span className="text-xs text-muted-foreground ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * Grid layout for multiple metric cards
 */
export function MetricCardGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return <div className={cn('grid gap-4', gridCols[columns], className)}>{children}</div>;
}
