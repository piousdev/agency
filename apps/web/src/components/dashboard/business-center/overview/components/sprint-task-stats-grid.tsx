import { memo, type ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { SPRINT_STAT_CONFIG } from '@/components/dashboard/business-center/overview/constants/sprint-config';
import type { SprintStatus } from '@/components/dashboard/business-center/overview/types';

interface TaskStatCardProps {
  readonly count: number;
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly bgClass: string;
  readonly iconClass: string;
}

const TaskStatCard = memo(function TaskStatCard({
  count,
  label,
  icon: Icon,
  bgClass,
  iconClass,
}: TaskStatCardProps) {
  return (
    <div className={cn('text-center p-2 rounded-lg', bgClass)}>
      <div className="flex items-center justify-center gap-1">
        <Icon className={cn('h-3.5 w-3.5', iconClass)} aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold mt-1">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
});

interface TaskStatsGridProps {
  readonly todoTasks: number;
  readonly inProgressTasks: number;
  readonly completedTasks: number;
  readonly blockedTasks: number;
}

export const TaskStatsGrid = memo(function TaskStatsGrid({
  todoTasks,
  inProgressTasks,
  completedTasks,
  blockedTasks,
}: TaskStatsGridProps) {
  const stats: readonly { status: SprintStatus; count: number }[] = [
    { status: 'todo', count: todoTasks },
    { status: 'in_progress', count: inProgressTasks },
    { status: 'completed', count: completedTasks },
    { status: 'blocked', count: blockedTasks },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {stats.map(({ status, count }) => {
        const config = SPRINT_STAT_CONFIG[status];
        return (
          <TaskStatCard
            key={status}
            count={count}
            label={config.label}
            icon={config.icon}
            bgClass={config.bgClass}
            iconClass={config.iconClass}
          />
        );
      })}
    </div>
  );
});
