import type {
  ChartColor,
  ChartColorConfig,
} from '@/components/default/dashboard/business-center/overview/shared/components/sparkline-chart/types';

export const CHART_COLORS: Readonly<Record<ChartColor, ChartColorConfig>> = {
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
} as const;

export const BAR_CHART_COLORS: Readonly<Record<Exclude<ChartColor, 'primary'>, string>> = {
  'chart-1': 'bg-[var(--color-chart-1)]',
  'chart-2': 'bg-[var(--color-chart-2)]',
  'chart-3': 'bg-[var(--color-chart-3)]',
  'chart-4': 'bg-[var(--color-chart-4)]',
  'chart-5': 'bg-[var(--color-chart-5)]',
} as const;

export const CHART_DEFAULTS = {
  COLOR: 'chart-1' as const,
  HEIGHT: 40,
  SHOW_TOOLTIP: true,
  SHOW_AREA: true,
  MIN_BAR_HEIGHT: 2,
} as const;

export const CHART_MARGINS = {
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
} as const;

export const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  fontSize: '12px',
} as const;

export const ACTIVE_DOT_CONFIG = {
  r: 3,
  strokeWidth: 0,
} as const;
