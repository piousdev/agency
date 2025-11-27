import { memo } from 'react';

import { SparklineChart } from '@/components/default/dashboard/business-center/overview/shared/components/sparkline-chart';
import { getRemainingWork } from '@/components/default/dashboard/business-center/overview/utils/sprint';

import type { BurndownDataPoint } from '@/components/default/dashboard/business-center/overview/types';

interface BurndownSectionProps {
  readonly data: readonly BurndownDataPoint[];
}

export const BurndownSection = memo(function BurndownSection({ data }: BurndownSectionProps) {
  const remaining = getRemainingWork(data);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Burndown</span>
        <span>{remaining} remaining</span>
      </div>
      <SparklineChart
        data={data as { value: number; label?: string }[]}
        color="chart-1"
        height={50}
        showTooltip
        showArea
      />
    </div>
  );
});
