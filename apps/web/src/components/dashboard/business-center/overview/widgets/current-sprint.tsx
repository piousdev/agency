'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconArrowRight,
  IconFlame,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import { SparklineChart } from '../shared/sparkline-chart';

interface SprintData {
  id: string;
  name: string;
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  daysRemaining: number;
  burndownData?: { value: number; label?: string }[];
  velocity?: number;
  previousVelocity?: number;
}

// Mock data - using static dates to avoid hydration issues
const MOCK_SPRINT: SprintData = {
  id: '1',
  name: 'Sprint 4',
  projectName: 'Acme Website Redesign',
  startDate: '2025-11-16T00:00:00Z',
  endDate: '2025-11-30T00:00:00Z',
  totalTasks: 24,
  completedTasks: 14,
  inProgressTasks: 6,
  blockedTasks: 1,
  daysRemaining: 7,
  // Burndown data - remaining work per day
  burndownData: [
    { value: 24, label: 'Day 1' },
    { value: 22, label: 'Day 2' },
    { value: 20, label: 'Day 3' },
    { value: 18, label: 'Day 4' },
    { value: 16, label: 'Day 5' },
    { value: 14, label: 'Day 6' },
    { value: 10, label: 'Day 7' },
  ],
  velocity: 14,
  previousVelocity: 12,
};

export interface CurrentSprintWidgetProps {
  sprint?: SprintData;
  className?: string;
}

export function CurrentSprintWidget({ sprint: propSprint, className }: CurrentSprintWidgetProps) {
  const overviewData = useOverviewData();

  // Use context data if available, otherwise fall back to props or mock
  // Cast to local SprintData type to allow optional fields
  const serverSprint = overviewData?.sprint;
  const sprint: SprintData = serverSprint
    ? {
        ...serverSprint,
        // Add optional fields with defaults (server doesn't provide these yet)
        burndownData: undefined,
        velocity: undefined,
        previousVelocity: undefined,
      }
    : propSprint || MOCK_SPRINT;

  // Handle case where there's no sprint
  if (!sprint) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconFlame className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-medium">No Active Sprint</p>
        <p className="text-sm text-muted-foreground mt-1">Start a new sprint to track progress</p>
      </div>
    );
  }

  const progress =
    sprint.totalTasks > 0 ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100) : 0;
  const todoTasks =
    sprint.totalTasks - sprint.completedTasks - sprint.inProgressTasks - sprint.blockedTasks;

  const isOnTrack = () => {
    if (!sprint.startDate || !sprint.endDate) return true;
    const totalDays = Math.ceil(
      (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (totalDays <= 0) return true;
    const elapsedDays = totalDays - sprint.daysRemaining;
    const expectedProgress = (elapsedDays / totalDays) * 100;
    return progress >= expectedProgress - 10; // 10% tolerance
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Sprint Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <IconFlame className="h-4 w-4 text-warning" />
            <span className="font-medium">{sprint.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{sprint.projectName}</p>
        </div>
        <Badge variant={isOnTrack() ? 'default' : 'destructive'}>
          {sprint.daysRemaining}d left
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <IconClock className="h-3.5 w-3.5" />
          </div>
          <p className="text-lg font-semibold mt-1">{todoTasks}</p>
          <p className="text-xs text-muted-foreground">To Do</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-primary/10">
          <div className="flex items-center justify-center gap-1 text-primary">
            <IconClock className="h-3.5 w-3.5" />
          </div>
          <p className="text-lg font-semibold mt-1">{sprint.inProgressTasks}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-success/10">
          <div className="flex items-center justify-center gap-1 text-success">
            <IconCheck className="h-3.5 w-3.5" />
          </div>
          <p className="text-lg font-semibold mt-1">{sprint.completedTasks}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-destructive/10">
          <div className="flex items-center justify-center gap-1 text-destructive">
            <IconAlertCircle className="h-3.5 w-3.5" />
          </div>
          <p className="text-lg font-semibold mt-1">{sprint.blockedTasks}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
      </div>

      {/* Mini Burndown Chart */}
      {sprint.burndownData && sprint.burndownData.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Burndown</span>
            <span>{sprint.burndownData[sprint.burndownData.length - 1]?.value || 0} remaining</span>
          </div>
          <SparklineChart
            data={sprint.burndownData}
            color="chart-1"
            height={50}
            showTooltip={true}
            showArea={true}
          />
        </div>
      )}

      {/* Velocity Comparison */}
      {sprint.velocity !== undefined && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Velocity</span>
            <span className="font-semibold">{sprint.velocity}</span>
            <span className="text-xs text-muted-foreground">pts/sprint</span>
          </div>
          {sprint.previousVelocity !== undefined && (
            <div className="flex items-center gap-1">
              {sprint.velocity > sprint.previousVelocity ? (
                <IconTrendingUp className="h-4 w-4 text-success" />
              ) : sprint.velocity < sprint.previousVelocity ? (
                <IconTrendingDown className="h-4 w-4 text-destructive" />
              ) : null}
              <span
                className={cn(
                  'text-xs',
                  sprint.velocity > sprint.previousVelocity
                    ? 'text-success'
                    : sprint.velocity < sprint.previousVelocity
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                )}
              >
                {sprint.velocity > sprint.previousVelocity ? '+' : ''}
                {sprint.velocity - sprint.previousVelocity} vs prev
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/business-center/sprints">
            View sprint board
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
