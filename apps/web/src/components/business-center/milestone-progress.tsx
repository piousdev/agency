'use client';

import { Progress } from '@/components/ui/progress';
import type { Milestone } from '@/lib/api/milestones/types';
import type { MilestoneStatus } from '@/lib/schemas/milestone';
import {
  IconCircleCheck,
  IconProgress,
  IconClock,
  IconCircleX,
  IconBan,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface MilestoneProgressProps {
  milestones: Milestone[];
  showDetails?: boolean;
  className?: string;
}

const statusConfig: Record<
  MilestoneStatus,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  completed: {
    icon: <IconCircleCheck className="h-4 w-4" />,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
  },
  in_progress: {
    icon: <IconProgress className="h-4 w-4" />,
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
  },
  pending: {
    icon: <IconClock className="h-4 w-4" />,
    label: 'Pending',
    color: 'text-gray-600',
    bgColor: 'bg-gray-400',
  },
  missed: {
    icon: <IconCircleX className="h-4 w-4" />,
    label: 'Missed',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
  },
  cancelled: {
    icon: <IconBan className="h-4 w-4" />,
    label: 'Cancelled',
    color: 'text-gray-400',
    bgColor: 'bg-gray-300',
  },
};

export function MilestoneProgress({
  milestones,
  showDetails = true,
  className,
}: MilestoneProgressProps) {
  const total = milestones.length;

  if (total === 0) {
    return null;
  }

  // Count by status
  const counts: Record<MilestoneStatus, number> = {
    completed: 0,
    in_progress: 0,
    pending: 0,
    missed: 0,
    cancelled: 0,
  };

  milestones.forEach((m) => {
    counts[m.status]++;
  });

  // Calculate percentages (completed and in_progress count towards progress)
  const completedPercent = (counts.completed / total) * 100;
  const inProgressPercent = (counts.in_progress / total) * 100;
  const progressPercent = completedPercent + inProgressPercent * 0.5; // In progress counts as half

  // Calculate active milestones (not cancelled)
  const activeMilestones = total - counts.cancelled;
  const activeCompletedPercent =
    activeMilestones > 0 ? (counts.completed / activeMilestones) * 100 : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(activeCompletedPercent)}% complete</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          {/* Completed (green) */}
          <div
            className="absolute h-full bg-green-500 transition-all duration-300"
            style={{ width: `${completedPercent}%` }}
          />
          {/* In Progress (blue, partial) */}
          <div
            className="absolute h-full bg-blue-500/60 transition-all duration-300"
            style={{
              left: `${completedPercent}%`,
              width: `${inProgressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Status Breakdown */}
      {showDetails && (
        <div className="flex flex-wrap gap-4 text-sm">
          {(
            ['completed', 'in_progress', 'pending', 'missed', 'cancelled'] as MilestoneStatus[]
          ).map((status) => {
            const count = counts[status];
            if (count === 0) return null;
            const config = statusConfig[status];
            return (
              <div key={status} className={cn('flex items-center gap-1.5', config.color)}>
                {config.icon}
                <span>
                  {count} {config.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function MilestoneProgressCompact({
  milestones,
  className,
}: {
  milestones: Milestone[];
  className?: string;
}) {
  const total = milestones.length;
  if (total === 0) return null;

  const completed = milestones.filter((m) => m.status === 'completed').length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Progress value={percent} className="h-1.5 flex-1 max-w-24" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}

/**
 * Badge version for card/list displays
 */
export function MilestoneProgressBadge({
  milestones,
  className,
}: {
  milestones: Milestone[];
  className?: string;
}) {
  const total = milestones.length;
  if (total === 0) return null;

  const completed = milestones.filter((m) => m.status === 'completed').length;
  const percent = Math.round((completed / total) * 100);

  let badgeColor = 'bg-gray-100 text-gray-700';
  if (percent === 100) {
    badgeColor = 'bg-green-100 text-green-700';
  } else if (percent >= 50) {
    badgeColor = 'bg-blue-100 text-blue-700';
  } else if (percent > 0) {
    badgeColor = 'bg-yellow-100 text-yellow-700';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        badgeColor,
        className
      )}
    >
      <IconCircleCheck className="h-3 w-3" />
      {completed}/{total}
    </span>
  );
}
