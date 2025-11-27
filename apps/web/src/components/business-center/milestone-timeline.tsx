'use client';

import {
  IconFlag,
  IconClock,
  IconProgress,
  IconCircleCheck,
  IconCircleX,
  IconBan,
} from '@tabler/icons-react';
import { format, isPast, isFuture, isToday } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMilestoneStatusColor, type MilestoneStatus } from '@/lib/schemas/milestone';
import { cn } from '@/lib/utils';

import type { Milestone } from '@/lib/api/milestones/types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  className?: string;
}

const statusIcons: Record<MilestoneStatus, React.ReactNode> = {
  pending: <IconClock className="h-4 w-4" />,
  in_progress: <IconProgress className="h-4 w-4" />,
  completed: <IconCircleCheck className="h-4 w-4" />,
  missed: <IconCircleX className="h-4 w-4" />,
  cancelled: <IconBan className="h-4 w-4" />,
};

export function MilestoneTimeline({ milestones, className }: MilestoneTimelineProps) {
  // Sort milestones by due date (null dates at the end)
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (milestones.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFlag className="h-5 w-5" />
          Milestone Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Milestones */}
          <div className="space-y-6">
            {sortedMilestones.map((milestone, _index) => {
              const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null;
              const isOverdue =
                dueDate &&
                isPast(dueDate) &&
                !isToday(dueDate) &&
                milestone.status !== 'completed' &&
                milestone.status !== 'cancelled';
              const isUpcoming = dueDate && isFuture(dueDate);
              const isDueToday = dueDate && isToday(dueDate);

              return (
                <div key={milestone.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                      milestone.status === 'completed' && 'border-green-500 bg-green-50',
                      milestone.status === 'in_progress' && 'border-blue-500 bg-blue-50',
                      milestone.status === 'missed' && 'border-red-500 bg-red-50',
                      milestone.status === 'cancelled' && 'border-gray-400 bg-gray-50',
                      milestone.status === 'pending' &&
                        isOverdue &&
                        'border-orange-500 bg-orange-50',
                      milestone.status === 'pending' && !isOverdue && 'border-gray-300 bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        milestone.status === 'completed' && 'text-green-600',
                        milestone.status === 'in_progress' && 'text-blue-600',
                        milestone.status === 'missed' && 'text-red-600',
                        milestone.status === 'cancelled' && 'text-gray-400',
                        milestone.status === 'pending' && isOverdue && 'text-orange-600',
                        milestone.status === 'pending' && !isOverdue && 'text-gray-500'
                      )}
                    >
                      {statusIcons[milestone.status]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('shrink-0', getMilestoneStatusColor(milestone.status))}
                      >
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Date info */}
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      {dueDate && (
                        <span
                          className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-red-600 font-medium',
                            isDueToday && 'text-orange-600 font-medium',
                            isUpcoming && 'text-muted-foreground'
                          )}
                        >
                          <IconClock className="h-3 w-3" />
                          {isDueToday
                            ? 'Due today'
                            : isOverdue
                              ? `Overdue (${format(dueDate, 'MMM d, yyyy')})`
                              : `Due ${format(dueDate, 'MMM d, yyyy')}`}
                        </span>
                      )}
                      {milestone.completedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <IconCircleCheck className="h-3 w-3" />
                          Completed {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact horizontal timeline for dashboard cards
 */
export function MilestoneTimelineCompact({
  milestones,
  className,
}: {
  milestones: Milestone[];
  className?: string;
}) {
  const sortedMilestones = [...milestones]
    .filter((m) => m.dueDate && m.status !== 'cancelled')
    .sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 5);

  if (sortedMilestones.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {sortedMilestones.map((milestone, _index) => (
        <div
          key={milestone.id}
          className={cn(
            'h-2 flex-1 rounded-full',
            milestone.status === 'completed' && 'bg-green-500',
            milestone.status === 'in_progress' && 'bg-blue-500',
            milestone.status === 'missed' && 'bg-red-500',
            milestone.status === 'pending' && 'bg-gray-300'
          )}
          title={`${milestone.name}: ${milestone.status.replace('_', ' ')}`}
        />
      ))}
    </div>
  );
}
