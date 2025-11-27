import { cn } from '@/lib/utils';
import { formatDueDate } from '@/lib/utils/date-formatters';

import type { DeadlineItem as DeadlineItemType } from '@/components/default/dashboard/business-center/overview/types';

export function DeadlineMeta({
  deadline,
  overdue,
}: {
  deadline: DeadlineItemType;
  overdue: boolean;
}) {
  return (
    <div className="text-right shrink-0" data-testid="deadline-meta">
      <span
        className={cn('text-sm font-medium', overdue ? 'text-destructive' : 'text-foreground')}
        data-testid="deadline-meta-date"
      >
        {formatDueDate(deadline.dueAt)}
      </span>
      {deadline.clientName && (
        <p className="text-xs text-muted-foreground mt-1" data-testid="deadline-meta-client-name">
          {deadline.clientName}
        </p>
      )}
    </div>
  );
}
