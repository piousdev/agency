'use client';

import { memo } from 'react';

import { BlockerItem } from '@/components/default/dashboard/business-center/overview/components/blocker-item';
import { BlockersEmptyState } from '@/components/default/dashboard/business-center/overview/components/blockers-empty-state';
import { BlockersFooter } from '@/components/default/dashboard/business-center/overview/components/blockers-footer';
import { BlockersSummary } from '@/components/default/dashboard/business-center/overview/components/blockers-summary';
import {
  useBlockersData,
  useBlockerActions,
} from '@/components/default/dashboard/business-center/overview/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { BlockerItem as BlockerItemType } from '@/components/default/dashboard/business-center/overview/types';

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
