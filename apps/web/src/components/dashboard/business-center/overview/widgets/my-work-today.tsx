'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconArrowRight,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconFilter,
  IconSortAscending,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import { toast } from 'sonner';

interface TaskItem {
  id: string;
  title: string;
  projectName?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueAt?: string | null;
  status: 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';
  ticketNumber?: string | null;
  storyPoints?: number | null;
  isBlocked?: boolean;
}

type SortOption = 'due_date' | 'priority' | 'points';
type FilterOption = 'all' | 'high_priority' | 'due_today' | 'blocked';

const priorityOrder: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// Mock data - will be replaced with real data from server
// Using static timestamps to avoid hydration mismatches
const MOCK_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Review client feedback on homepage redesign',
    projectName: 'Acme Website Redesign',
    priority: 'high',
    dueAt: '2025-11-23T14:00:00Z', // Static date
    status: 'in_progress',
    ticketNumber: 'TKT-001',
  },
  {
    id: '2',
    title: 'Fix navigation bug on mobile',
    projectName: 'TechCorp Mobile App',
    priority: 'critical',
    dueAt: '2025-11-23T16:00:00Z', // Static date
    status: 'open',
    ticketNumber: 'TKT-002',
  },
  {
    id: '3',
    title: 'Update API documentation',
    projectName: 'Internal Tools',
    priority: 'medium',
    status: 'open',
    ticketNumber: 'TKT-003',
  },
  {
    id: '4',
    title: 'Implement user settings page',
    projectName: 'Acme Website Redesign',
    priority: 'medium',
    dueAt: '2025-11-24T14:00:00Z', // Static date
    status: 'pending_client',
    ticketNumber: 'TKT-004',
  },
];

export interface MyWorkTodayWidgetProps {
  tasks?: TaskItem[];
  className?: string;
}

export function MyWorkTodayWidget({ tasks: propTasks, className }: MyWorkTodayWidgetProps) {
  const overviewData = useOverviewData();
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Use context data if available, otherwise fall back to props or mock
  const rawTasks: TaskItem[] =
    overviewData?.myWork.map((t) => ({
      id: t.id,
      title: t.title,
      projectName: t.projectName,
      priority: t.priority,
      dueAt: t.dueAt,
      status: t.status,
      ticketNumber: t.ticketNumber,
      storyPoints: (t as { storyPoints?: number | null }).storyPoints ?? null,
      isBlocked: (t as { isBlocked?: boolean }).isBlocked ?? false,
    })) ||
    propTasks ||
    MOCK_TASKS;

  // Apply filtering and sorting
  const tasks = useMemo(() => {
    let filtered = [...rawTasks];

    // Apply filter
    switch (filterBy) {
      case 'high_priority':
        filtered = filtered.filter((t) => t.priority === 'critical' || t.priority === 'high');
        break;
      case 'due_today':
        filtered = filtered.filter((t) => {
          if (!t.dueAt) return false;
          const dueDate = new Date(t.dueAt);
          const today = new Date();
          return (
            dueDate.getDate() === today.getDate() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getFullYear() === today.getFullYear()
          );
        });
        break;
      case 'blocked':
        filtered = filtered.filter((t) => t.isBlocked);
        break;
    }

    // Apply sort
    switch (sortBy) {
      case 'due_date':
        filtered.sort((a, b) => {
          if (!a.dueAt && !b.dueAt) return 0;
          if (!a.dueAt) return 1;
          if (!b.dueAt) return -1;
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        });
        break;
      case 'priority':
        filtered.sort(
          (a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );
        break;
      case 'points':
        filtered.sort((a, b) => (b.storyPoints || 0) - (a.storyPoints || 0));
        break;
    }

    return filtered;
  }, [rawTasks, sortBy, filterBy]);

  // Task quick actions
  const handleMarkDone = (taskId: string, taskTitle: string) => {
    toast.success(`Marked "${taskTitle}" as done`, {
      description: 'Task status updated',
    });
  };

  const handleStartTimer = (taskId: string, taskTitle: string) => {
    toast.info(`Timer started for "${taskTitle}"`, {
      description: 'Time tracking active',
    });
  };
  const priorityColors: Record<string, string> = {
    low: 'bg-muted-foreground',
    medium: 'bg-primary',
    high: 'bg-warning',
    critical: 'bg-destructive',
  };

  const statusLabels: Record<string, string> = {
    open: 'To Do',
    in_progress: 'In Progress',
    pending_client: 'Waiting',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const isOverdue = (dueAt?: string) => {
    if (!dueAt) return false;
    return new Date(dueAt) < new Date();
  };

  const formatDueTime = (dueAt?: string) => {
    if (!dueAt) return null;
    const date = new Date(dueAt);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 0) return 'Overdue';
    if (diffHours === 0) return 'Due now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.round(diffHours / 24)}d`;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Sort and Filter Controls */}
      <div className="flex items-center gap-2 mb-3">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <IconSortAscending className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="points">Points</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <IconFilter className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="high_priority">High Priority</SelectItem>
            <SelectItem value="due_today">Due Today</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks match your filter
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <Checkbox
                  className="mt-1"
                  onCheckedChange={(checked) => {
                    if (checked) handleMarkDone(task.id, task.title);
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', priorityColors[task.priority])} />
                    <Link
                      href={`/dashboard/business-center/intake-queue/${task.id}`}
                      className="font-medium text-sm truncate hover:underline"
                    >
                      {task.title}
                    </Link>
                    {task.isBlocked && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1">
                        Blocked
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {task.ticketNumber && <span>{task.ticketNumber}</span>}
                    {task.projectName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{task.projectName}</span>
                      </>
                    )}
                    {task.storyPoints && (
                      <>
                        <span>•</span>
                        <span>{task.storyPoints} pts</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {statusLabels[task.status]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStartTimer(task.id, task.title)}
                      title="Start timer"
                    >
                      <IconClock className="h-3 w-3" />
                    </Button>
                  </div>
                  {task.dueAt && (
                    <span
                      className={cn(
                        'flex items-center gap-1 text-xs',
                        isOverdue(task.dueAt) ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    >
                      {isOverdue(task.dueAt) ? (
                        <IconAlertTriangle className="h-3 w-3" />
                      ) : (
                        <IconClock className="h-3 w-3" />
                      )}
                      {formatDueTime(task.dueAt)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/tasks/mine">
            View all my tasks
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Compact summary version for smaller widgets
 */
export function MyWorkTodaySummary({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <IconCircleCheck className="h-5 w-5 text-success" />
          <div>
            <p className="text-2xl font-semibold">12</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconClock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-2xl font-semibold">4</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="text-2xl font-semibold">2</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
}
