'use client';

import { DeadlineActions } from '@/components/default/dashboard/business-center/overview/components/deadline-actions';
import { DeadlineItem } from '@/components/default/dashboard/business-center/overview/components/deadline-item';
import { useDeadlines } from '@/components/default/dashboard/business-center/overview/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import type { DeadlineItem as DeadlineItemType } from '@/components/default/dashboard/business-center/overview/types';

export interface UpcomingDeadlinesWidgetProps {
  deadlines?: DeadlineItemType[];
  className?: string;
}

export function UpcomingDeadlinesWidget({
  deadlines: propDeadlines,
  className,
}: UpcomingDeadlinesWidgetProps) {
  const { deadlines } = useDeadlines({ deadlines: propDeadlines });

  return (
    <div className={cn('flex flex-col h-full', className)} data-testid="upcoming-deadlines-widget">
      <ScrollArea className="flex-1 -mx-4 px-4" data-testid="upcoming-deadlines-widget-scroll-area">
        <div className="space-y-3 p-2" data-testid="upcoming-deadlines-widget-content">
          {deadlines.map((deadline) => (
            <DeadlineItem key={deadline.id} deadline={deadline} />
          ))}
        </div>
      </ScrollArea>

      <DeadlineActions />
    </div>
  );
}
