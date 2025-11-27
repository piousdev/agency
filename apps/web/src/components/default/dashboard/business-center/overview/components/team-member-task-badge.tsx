import { STATUS_BADGE_VARIANTS } from '@/components/default/dashboard/business-center/overview/constants/status-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { TeamMember } from '@/components/default/dashboard/business-center/overview/types';

interface TaskBadgeProps {
  readonly count: number;
  readonly status: TeamMember['status'];
}

export const TaskBadge = ({ count, status }: TaskBadgeProps) => {
  const variantClass = STATUS_BADGE_VARIANTS[status];

  return (
    <div className="text-right" data-testid="member-task-badge-container">
      <Badge
        variant="outline"
        className={cn('text-xs', variantClass)}
        data-testid="member-task-badge"
      >
        <span data-testid="member-task-badge-text">
          {count} {count === 1 ? 'task' : 'tasks'}
        </span>
      </Badge>
    </div>
  );
};

TaskBadge.displayName = 'TaskBadge';
