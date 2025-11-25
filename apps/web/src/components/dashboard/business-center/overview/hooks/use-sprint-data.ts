import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_SPRINT } from '@/components/dashboard/business-center/overview/constants/s-mock-data';
import {
  calculateProgress,
  calculateTodoTasks,
  isSprintOnTrack,
  getVelocityTrend,
  calculateVelocityChange,
} from '@/components/dashboard/business-center/overview/utils/sprint';
import type {
  SprintData,
  SprintStats,
} from '@/components/dashboard/business-center/overview/types';

interface UseSprintDataOptions {
  readonly sprint?: SprintData;
}

interface UseSprintDataReturn {
  readonly sprint: SprintData | null;
  readonly stats: SprintStats;
  readonly hasSprint: boolean;
  readonly hasBurndown: boolean;
  readonly hasVelocity: boolean;
}

export function useSprintData(options: UseSprintDataOptions = {}): UseSprintDataReturn {
  const { sprint: propSprint } = options;
  const overviewData = useOverviewData();

  const sprint = useMemo<SprintData | null>(() => {
    // Priority: server data > prop data > mock data
    const serverSprint = overviewData?.sprint;

    if (serverSprint) {
      return {
        ...serverSprint,
        // Server doesn't provide these optional fields yet
        burndownData: undefined,
        velocity: undefined,
        previousVelocity: undefined,
      };
    }

    return propSprint ?? MOCK_SPRINT;
  }, [overviewData?.sprint, propSprint]);

  const stats = useMemo<SprintStats>(() => {
    if (!sprint) {
      return {
        progress: 0,
        todoTasks: 0,
        isOnTrack: true,
        velocityTrend: 'stable',
        velocityChange: 0,
      };
    }

    const progress = calculateProgress(sprint.completedTasks, sprint.totalTasks);

    return {
      progress,
      todoTasks: calculateTodoTasks(sprint),
      isOnTrack: isSprintOnTrack(sprint, progress),
      velocityTrend: getVelocityTrend(sprint.velocity, sprint.previousVelocity),
      velocityChange: calculateVelocityChange(sprint.velocity, sprint.previousVelocity),
    };
  }, [sprint]);

  return {
    sprint,
    stats,
    hasSprint: sprint !== null,
    hasBurndown: Boolean(sprint?.burndownData?.length),
    hasVelocity: sprint?.velocity !== undefined,
  };
}
