import { Badge } from '@/components/ui/badge';
import { IconCalendar, IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { formatDueDate, isOverdue } from '@/lib/utils/date-formatters';
import { DEADLINE_TYPE_COLORS } from '@/components/dashboard/business-center/overview/constants/ud-type-colors';
import type { DeadlineItem as DeadlineItemType } from '@/components/dashboard/business-center/overview/types';

interface DeadlineItemProps {
  deadline: DeadlineItemType;
}

export function DeadlineItem({ deadline }: DeadlineItemProps) {
  const overdue = isOverdue(deadline.dueAt);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <DeadlineIcon overdue={overdue} />
      <DeadlineContent deadline={deadline} />
      <DeadlineMeta deadline={deadline} overdue={overdue} />
    </div>
  );
}

function DeadlineIcon({ overdue }: { overdue: boolean }) {
  return (
    <div className={cn('mt-1 p-2 rounded-lg', overdue ? 'bg-destructive/10' : 'bg-muted')}>
      {overdue ? (
        <IconAlertTriangle className="h-4 w-4 text-destructive" />
      ) : (
        <IconCalendar className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

function DeadlineContent({ deadline }: { deadline: DeadlineItemType }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm truncate">{deadline.title}</p>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="outline" className={cn('text-xs', DEADLINE_TYPE_COLORS[deadline.type])}>
          {deadline.type}
        </Badge>
        {deadline.projectName && (
          <span className="text-xs text-muted-foreground truncate">{deadline.projectName}</span>
        )}
      </div>
    </div>
  );
}

function DeadlineMeta({ deadline, overdue }: { deadline: DeadlineItemType; overdue: boolean }) {
  return (
    <div className="text-right shrink-0">
      <span className={cn('text-sm font-medium', overdue ? 'text-destructive' : 'text-foreground')}>
        {formatDueDate(deadline.dueAt)}
      </span>
      {deadline.clientName && (
        <p className="text-xs text-muted-foreground mt-1">{deadline.clientName}</p>
      )}
    </div>
  );
}
