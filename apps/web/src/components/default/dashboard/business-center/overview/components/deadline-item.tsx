import { DeadlineContent } from '@/components/default/dashboard/business-center/overview/components/deadline-content';
import { DeadlineIcon as _DeadlineIcon } from '@/components/default/dashboard/business-center/overview/components/deadline-icon';
import { DeadlineMeta } from '@/components/default/dashboard/business-center/overview/components/deadline-meta';
import { isOverdue } from '@/lib/utils/date-formatters';

import type { DeadlineItem as DeadlineItemType } from '@/components/default/dashboard/business-center/overview/types';

interface DeadlineItemProps {
  readonly deadline: DeadlineItemType;
}

export function DeadlineItem({ deadline }: DeadlineItemProps) {
  const overdue = isOverdue(deadline.dueAt);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
      data-testid="deadline-item"
      aria-label={deadline.title}
    >
      {/* <DeadlineIcon overdue={overdue} /> */}
      <DeadlineContent deadline={deadline} />
      <DeadlineMeta deadline={deadline} overdue={overdue} />
    </div>
  );
}
