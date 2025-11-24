'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  calculateSprintProgress,
  calculateDaysRemaining,
  getSprintStatusColor,
} from '@/lib/schemas/sprint';
import type { Sprint } from '@/lib/api/sprints/types';
import {
  IconChartLine,
  IconTarget,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import {
  differenceInDays,
  format,
  addDays,
  eachDayOfInterval,
  isAfter,
  isBefore,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

interface SprintBurndownProps {
  sprint: Sprint;
  /** Daily completed points data - array of { date: string, points: number } */
  dailyData?: Array<{ date: string; completedPoints: number }>;
  className?: string;
}

/**
 * Sprint Burndown Chart Component
 * Shows a visual representation of sprint progress with an ideal burndown line
 */
export function SprintBurndown({ sprint, dailyData = [], className }: SprintBurndownProps) {
  const progress = calculateSprintProgress(sprint.plannedPoints, sprint.completedPoints);
  const daysRemaining = calculateDaysRemaining(sprint.endDate);

  const chartData = useMemo(() => {
    if (!sprint.startDate || !sprint.endDate) {
      return null;
    }

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = differenceInDays(endDate, startDate);

    if (totalDays <= 0) return null;

    // Generate all days in the sprint
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate ideal burndown line
    const dailyBurnRate = sprint.plannedPoints / totalDays;

    // Map daily data for lookup
    const dailyMap = new Map(
      dailyData.map((d) => [format(new Date(d.date), 'yyyy-MM-dd'), d.completedPoints])
    );

    // Build chart points
    const points = allDays.map((date, index) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const idealRemaining = Math.max(0, sprint.plannedPoints - dailyBurnRate * index);
      const actualCompleted = dailyMap.get(dateKey);

      // If we have actual data, calculate remaining
      // Otherwise, for future dates, we don't have data yet
      const isPast = isBefore(date, new Date()) || isToday(date);

      return {
        date,
        dateLabel: format(date, 'MMM d'),
        dayIndex: index,
        idealRemaining: Math.round(idealRemaining),
        actualRemaining:
          actualCompleted !== undefined ? sprint.plannedPoints - actualCompleted : undefined,
        isPast,
        isToday: isToday(date),
      };
    });

    return {
      points,
      totalDays,
      plannedPoints: sprint.plannedPoints,
    };
  }, [sprint, dailyData]);

  // Calculate velocity indicators
  const velocityStatus = useMemo(() => {
    if (!chartData || sprint.plannedPoints === 0) return null;

    const expectedProgress =
      chartData.totalDays > 0
        ? ((chartData.totalDays - (daysRemaining ?? 0)) / chartData.totalDays) * 100
        : 0;

    const diff = progress - expectedProgress;

    if (diff >= 10) return { status: 'ahead', label: 'Ahead of schedule', color: 'text-green-600' };
    if (diff >= -10) return { status: 'on-track', label: 'On track', color: 'text-blue-600' };
    return { status: 'behind', label: 'Behind schedule', color: 'text-orange-600' };
  }, [chartData, progress, daysRemaining, sprint.plannedPoints]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconChartLine className="h-5 w-5" />
            Sprint Progress
          </CardTitle>
          <Badge variant="outline" className={cn('text-xs', getSprintStatusColor(sprint.status))}>
            {sprint.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconTarget className="h-3 w-3" />
              Progress
            </p>
            <p className="text-2xl font-bold">{progress}%</p>
            <p className="text-xs text-muted-foreground">
              {sprint.completedPoints} / {sprint.plannedPoints} pts
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IconClock className="h-3 w-3" />
              Time Remaining
            </p>
            <p className="text-2xl font-bold">
              {daysRemaining !== null ? (daysRemaining < 0 ? 0 : daysRemaining) : '-'}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining !== null && daysRemaining < 0
                ? `${Math.abs(daysRemaining)} days overdue`
                : 'days left'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {velocityStatus?.status === 'ahead' ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : velocityStatus?.status === 'behind' ? (
                <IconTrendingDown className="h-3 w-3" />
              ) : (
                <IconTarget className="h-3 w-3" />
              )}
              Velocity
            </p>
            <p className={cn('text-lg font-semibold', velocityStatus?.color)}>
              {velocityStatus?.label ?? 'N/A'}
            </p>
          </div>
        </div>

        {/* Simple Visual Burndown */}
        {chartData && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{format(new Date(sprint.startDate!), 'MMM d')}</span>
              <span>{format(new Date(sprint.endDate!), 'MMM d')}</span>
            </div>

            {/* Visual Progress Bar with Day Markers */}
            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
              {/* Ideal line (diagonal) */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0 100%)' }}
              />

              {/* Actual progress */}
              <div
                className="absolute bottom-0 left-0 h-full bg-primary/60 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />

              {/* Day markers */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                {chartData.points
                  .filter((_, i) => i % Math.ceil(chartData.totalDays / 7) === 0)
                  .map((point, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1 h-2 rounded-full',
                        point.isToday
                          ? 'bg-primary'
                          : point.isPast
                            ? 'bg-primary/40'
                            : 'bg-muted-foreground/20'
                      )}
                    />
                  ))}
              </div>

              {/* Today marker */}
              {sprint.status === 'active' && chartData.totalDays > 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-destructive"
                  style={{
                    left: `${Math.min(100, ((chartData.totalDays - (daysRemaining ?? 0)) / chartData.totalDays) * 100)}%`,
                  }}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-2 bg-primary/60 rounded" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-destructive" />
                Today
              </span>
            </div>
          </div>
        )}

        {/* Sprint Goal */}
        {sprint.goal && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Sprint Goal</p>
            <p className="text-sm">{sprint.goal}</p>
          </div>
        )}

        {/* No dates warning */}
        {(!sprint.startDate || !sprint.endDate) && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Set start and end dates to see the burndown chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Mini version of the burndown for list displays
 */
interface SprintBurndownMiniProps {
  sprint: Sprint;
  className?: string;
}

export function SprintBurndownMini({ sprint, className }: SprintBurndownMiniProps) {
  const progress = calculateSprintProgress(sprint.plannedPoints, sprint.completedPoints);
  const daysRemaining = calculateDaysRemaining(sprint.endDate);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {sprint.completedPoints}/{sprint.plannedPoints} pts
        </span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : 'bg-primary'
          )}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {sprint.status === 'active' && daysRemaining !== null && (
        <p
          className={cn(
            'text-xs',
            daysRemaining < 0 ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {daysRemaining < 0
            ? `${Math.abs(daysRemaining)} days overdue`
            : daysRemaining === 0
              ? 'Ends today'
              : `${daysRemaining} days left`}
        </p>
      )}
    </div>
  );
}
