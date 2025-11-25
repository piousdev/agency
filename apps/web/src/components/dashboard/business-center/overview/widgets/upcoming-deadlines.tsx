'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDeadlines } from '@/components/dashboard/business-center/overview/hooks';
import { DeadlineItem } from '@/components/dashboard/business-center/overview/components/deadline-item';
import { DeadlineActions } from '@/components/dashboard/business-center/overview/components/deadline-actions';
import type { DeadlineItem as DeadlineItemType } from '@/components/dashboard/business-center/overview/types';

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
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {deadlines.map((deadline) => (
            <DeadlineItem key={deadline.id} deadline={deadline} />
          ))}
        </div>
      </ScrollArea>

      <DeadlineActions deadlines={deadlines} />
    </div>
  );
}
