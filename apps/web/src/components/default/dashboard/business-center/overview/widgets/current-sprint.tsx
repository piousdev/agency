'use client';

import { memo } from 'react';

import { SprintActions } from '@/components/default/dashboard/business-center/overview/components/sprint-actions';
import { BurndownSection } from '@/components/default/dashboard/business-center/overview/components/sprint-burndown-section';
import { SprintEmptyState } from '@/components/default/dashboard/business-center/overview/components/sprint-empty-state';
import { SprintHeader } from '@/components/default/dashboard/business-center/overview/components/sprint-header';
import { SprintProgress } from '@/components/default/dashboard/business-center/overview/components/sprint-progress';
import { TaskStatsGrid } from '@/components/default/dashboard/business-center/overview/components/sprint-task-stats-grid';
import { VelocityComparison } from '@/components/default/dashboard/business-center/overview/components/sprint-velocity-comparison';
import { useSprintData } from '@/components/default/dashboard/business-center/overview/hooks';
import { cn } from '@/lib/utils';

import type { SprintData } from '@/components/default/dashboard/business-center/overview/types';

export interface CurrentSprintWidgetProps {
  readonly sprint?: SprintData;
  readonly className?: string;
}

export const CurrentSprintWidget = memo(function CurrentSprintWidget({
  sprint: propSprint,
  className,
}: CurrentSprintWidgetProps) {
  const { sprint, stats, hasSprint, hasBurndown, hasVelocity } = useSprintData({
    sprint: propSprint,
  });

  if (!hasSprint || !sprint) {
    return <SprintEmptyState className={className} />;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <SprintHeader
        name={sprint.name}
        projectName={sprint.projectName}
        daysRemaining={sprint.daysRemaining}
        isOnTrack={stats.isOnTrack}
      />

      <SprintProgress progress={stats.progress} />

      <TaskStatsGrid
        todoTasks={stats.todoTasks}
        inProgressTasks={sprint.inProgressTasks}
        completedTasks={sprint.completedTasks}
        blockedTasks={sprint.blockedTasks}
      />

      {hasBurndown && sprint.burndownData && <BurndownSection data={sprint.burndownData} />}

      {hasVelocity && sprint.velocity !== undefined && (
        <VelocityComparison
          velocity={sprint.velocity}
          trend={stats.velocityTrend}
          change={stats.velocityChange}
        />
      )}

      <SprintActions />
    </div>
  );
});
