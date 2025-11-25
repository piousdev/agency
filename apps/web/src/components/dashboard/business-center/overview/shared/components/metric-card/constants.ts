import type {
  MetricCardSize,
  GridColumns,
  TrendDirection,
} from '@/components/dashboard/business-center/overview/shared/components/metric-card/types';

export const SIZE_CLASSES: Readonly<Record<MetricCardSize, string>> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const;

export const VALUE_SIZE_CLASSES: Readonly<Record<MetricCardSize, string>> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
} as const;

export const TREND_COLORS: Readonly<Record<TrendDirection, string>> = {
  up: 'text-success',
  down: 'text-destructive',
  stable: 'text-muted-foreground',
} as const;

export const GRID_COLUMNS: Readonly<Record<GridColumns, string>> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
} as const;

export const METRIC_CARD_DEFAULTS = {
  SIZE: 'md' as const,
  COLUMNS: 4 as const,
} as const;

export const METRIC_CARD_CLASSES = {
  CONTAINER: 'rounded-lg border bg-card',
  HEADER: 'flex items-start justify-between',
  CONTENT: 'space-y-1',
  LABEL: 'text-sm text-muted-foreground',
  VALUE: 'font-bold',
  ICON_WRAPPER: 'p-2 rounded-lg bg-muted',
  TREND_CONTAINER: 'flex items-center gap-1 mt-2',
  TREND_ICON: 'h-4 w-4',
  CHANGE_TEXT: 'text-sm font-medium',
  CHANGE_LABEL: 'text-xs text-muted-foreground ml-1',
  GRID: 'grid gap-4',
} as const;
