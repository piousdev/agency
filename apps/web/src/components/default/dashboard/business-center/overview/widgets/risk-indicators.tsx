'use client';



import { RiskActions } from '@/components/default/dashboard/business-center/overview/components/risk-actions';
import { RiskEmptyState } from '@/components/default/dashboard/business-center/overview/components/risk-empty-state';
import { RiskItem } from '@/components/default/dashboard/business-center/overview/components/risk-item';
import { RiskSummaryHeader } from '@/components/default/dashboard/business-center/overview/components/risk-summary-header';
import { useRiskData } from '@/components/default/dashboard/business-center/overview/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { RiskSummary } from '@/components/default/dashboard/business-center/overview/types';

export interface RiskIndicatorsWidgetProps {
  readonly data?: RiskSummary;
  readonly className?: string;
}

export const RiskIndicatorsWidget = ({ data: propData, className }: RiskIndicatorsWidgetProps) => {
  const { data, isEmpty, sortedRisks } = useRiskData({ data: propData });

  if (isEmpty) {
    return <RiskEmptyState className={className} />;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <RiskSummaryHeader summary={data} />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {sortedRisks.map((risk) => (
            <RiskItem key={risk.id} risk={risk} />
          ))}
        </div>
      </ScrollArea>

      <RiskActions />
    </div>
  );
};
