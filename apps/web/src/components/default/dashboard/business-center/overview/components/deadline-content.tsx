import { DEADLINE_TYPE_COLORS } from '@/components/default/dashboard/business-center/overview/constants/ud-type-colors';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { DeadlineItem as DeadlineItemType } from '@/components/default/dashboard/business-center/overview/types';

interface DeadlineContentProps {
  readonly deadline: DeadlineItemType;
}

export function DeadlineContent({ deadline }: DeadlineContentProps) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-row items-center gap-2"
      data-testid="deadline-content"
      aria-label={deadline.title}
    >
      <div className="flex items-center gap-2 mt-1" data-testid="deadline-content-meta">
        <Badge
          variant="outline"
          className={cn('text-xs', DEADLINE_TYPE_COLORS[deadline.type])}
          data-testid="deadline-content-badge"
        >
          <span data-testid="deadline-content-badge-text">{deadline.type}</span>
        </Badge>
        {deadline.projectName && (
          <span
            className="text-xs text-muted-foreground truncate"
            data-testid="deadline-content-project-name"
          >
            {deadline.projectName}
          </span>
        )}
      </div>
      <p className="font-medium text-sm truncate" data-testid="deadline-content-title">
        {deadline.title}
      </p>
    </div>
  );
}
