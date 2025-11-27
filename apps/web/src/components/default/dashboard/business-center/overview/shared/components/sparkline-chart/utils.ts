// lib/sparkline-chart.utils.ts
import type { SparklineDataPoint } from '@/components/default/dashboard/business-center/overview/shared/components/sparkline-chart/types';

export const addIndexToData = (
  data: SparklineDataPoint[]
): (SparklineDataPoint & { index: number })[] => {
  return data.map((d, i) => ({
    ...d,
    index: i,
  }));
};

export const getMaxValue = (data: SparklineDataPoint[]): number => {
  return Math.max(...data.map((d) => d.value));
};

export const calculateBarHeight = (value: number, max: number): string => {
  return `${String((value / max) * 100)}%`;
};

export const formatTooltipLabel = (
  index: number,
  data: (SparklineDataPoint & { index: number })[]
): string => {
  return data[index]?.label ?? `Point ${String(index + 1)}`;
};

export const formatTooltipValue = (value: number): [number, string] => {
  return [value, 'Value'];
};
