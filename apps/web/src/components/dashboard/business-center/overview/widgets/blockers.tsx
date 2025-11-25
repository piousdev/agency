'use client';

import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  useBlockersData,
  useBlockerActions,
} from '@/components/dashboard/business-center/overview/hooks';
import { BlockersEmptyState } from '@/components/dashboard/business-center/overview/components/blockers-empty-state';
import { BlockersSummary } from '@/components/dashboard/business-center/overview/components/blockers-summary';
import { BlockerItem } from '@/components/dashboard/business-center/overview/components/blocker-item';
import { BlockersFooter } from '@/components/dashboard/business-center/overview/components/blockers-footer';
import type { BlockerItem as BlockerItemType } from '@/components/dashboard/business-center/overview/types';

export interface BlockersWidgetProps {
  readonly blockers?: readonly BlockerItemType[];
  readonly className?: string;
}

export const BlockersWidget = memo(function BlockersWidget({
  blockers: propBlockers,
  className,
}: BlockersWidgetProps) {
  const { blockers, count, isEmpty } = useBlockersData({
    blockers: propBlockers,
  });

  const { escalate, resolve } = useBlockerActions();

  if (isEmpty) {
    return <BlockersEmptyState className={className} />;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <BlockersSummary count={count} />

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {blockers.map((blocker) => (
            <BlockerItem
              key={blocker.id}
              blocker={blocker}
              onEscalate={escalate}
              onResolve={resolve}
            />
          ))}
        </div>
      </ScrollArea>

      <BlockersFooter />
    </div>
  );
});
