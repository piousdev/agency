export type SparklineDataPoint = Readonly<{
  value: number;
  label?: string;
}>;

export type ChartColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'primary';

export type ChartColorConfig = Readonly<{
  stroke: string;
  fill: string;
}>;

export type SparklineChartProps = Readonly<{
  data: SparklineDataPoint[];
  color?: ChartColor;
  height?: number;
  showTooltip?: boolean;
  showArea?: boolean;
  className?: string;
}>;

export type MiniBarChartProps = Readonly<{
  data: SparklineDataPoint[];
  color?: Exclude<ChartColor, 'primary'>;
  height?: number;
  className?: string;
}>;
