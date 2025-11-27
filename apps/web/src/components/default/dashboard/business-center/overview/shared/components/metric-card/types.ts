import type { ReactNode } from 'react';

export type TrendDirection = 'up' | 'down' | 'stable';

export type MetricCardSize = 'sm' | 'md' | 'lg';

export type GridColumns = 2 | 3 | 4;

export type MetricCardProps = Readonly<{
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  icon?: ReactNode;
  className?: string;
  size?: MetricCardSize;
}>;

export type MetricCardGridProps = Readonly<{
  children: ReactNode;
  columns?: GridColumns;
  className?: string;
}>;

export type TrendIndicatorProps = Readonly<{
  trend?: TrendDirection;
  change?: number;
  changeLabel?: string;
}>;

export type MetricIconProps = Readonly<{
  icon: ReactNode;
}>;
