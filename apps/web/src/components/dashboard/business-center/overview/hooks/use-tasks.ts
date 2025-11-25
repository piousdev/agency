import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_TASKS } from '@/components/dashboard/business-center/overview/constants/t-mock-data';
import { isOverdue } from '@/components/dashboard/business-center/overview/utils/task';
import type {
  TaskItem,
  TaskSummaryStats,
} from '@/components/dashboard/business-center/overview/types';

interface UseTasksOptions {
  readonly tasks?: readonly TaskItem[];
}

interface UseTasksReturn {
  readonly tasks: readonly TaskItem[];
  readonly stats: TaskSummaryStats;
  readonly isEmpty: boolean;
  readonly markTaskDone: (taskId: string, taskTitle: string) => void;
  readonly startTimer: (taskId: string, taskTitle: string) => void;
}

/**
 * Transforms server data to TaskItem format.
 */
function transformServerTask(serverTask: {
  id: string;
  title: string;
  projectName?: string | null;
  priority: string;
  dueAt?: string | null;
  status: string;
  ticketNumber?: string | null;
  storyPoints?: number | null;
  isBlocked?: boolean;
}): TaskItem {
  return {
    id: serverTask.id,
    title: serverTask.title,
    projectName: serverTask.projectName,
    priority: serverTask.priority as TaskItem['priority'],
    dueAt: serverTask.dueAt,
    status: serverTask.status as TaskItem['status'],
    ticketNumber: serverTask.ticketNumber,
    storyPoints: serverTask.storyPoints ?? null,
    isBlocked: serverTask.isBlocked ?? false,
  };
}

/**
 * Calculates summary stats from tasks.
 */
function calculateStats(tasks: readonly TaskItem[]): TaskSummaryStats {
  return {
    completed: tasks.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    overdue: tasks.filter((t) => isOverdue(t.dueAt)).length,
  };
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { tasks: propTasks } = options;
  const overviewData = useOverviewData();

  const tasks = useMemo<readonly TaskItem[]>(() => {
    // Priority: server data > prop data > mock data
    if (overviewData?.myWork?.length) {
      return overviewData.myWork.map(transformServerTask);
    }
    return propTasks ?? MOCK_TASKS;
  }, [overviewData?.myWork, propTasks]);

  const stats = useMemo(() => calculateStats(tasks), [tasks]);

  const markTaskDone = useCallback((taskId: string, taskTitle: string) => {
    toast.success(`Marked "${taskTitle}" as done`, {
      description: 'Task status updated',
    });
    // TODO: Implement actual mutation
  }, []);

  const startTimer = useCallback((taskId: string, taskTitle: string) => {
    toast.info(`Timer started for "${taskTitle}"`, {
      description: 'Time tracking active',
    });
    // TODO: Implement actual timer start
  }, []);

  return {
    tasks,
    stats,
    isEmpty: tasks.length === 0,
    markTaskDone,
    startTimer,
  };
}
