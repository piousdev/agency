import { useMemo } from 'react';
import { useOverviewData } from '@/components/dashboard/business-center/overview/context/overview-data-context';
import { MOCK_TEAM } from '@/components/dashboard/business-center/overview/constants/ts-mock-data';
import { safeAverage } from '@/components/dashboard/business-center/overview/utils/member';
import {
  isValidTeamMemberStatus,
  type TeamMember,
  type TeamStats,
} from '@/components/dashboard/business-center/overview/types';

interface UseTeamStatusOptions {
  readonly team?: readonly TeamMember[];
}

interface UseTeamStatusReturn {
  readonly team: readonly TeamMember[];
  readonly stats: TeamStats;
  readonly isEmpty: boolean;
}

/**
 * Transforms server status to widget status with validation.
 */
function normalizeStatus(status: unknown): TeamMember['status'] {
  if (isValidTeamMemberStatus(status)) return status;
  // Fallback for unknown statuses
  console.warn(`Unknown team member status: ${status}`);
  return 'away';
}

/**
 * Calculates team statistics from member data.
 */
function calculateStats(team: readonly TeamMember[]): TeamStats {
  const taskCounts = team.map((m) => m.tasksInProgress);

  return {
    available: team.filter((m) => m.status === 'available').length,
    busy: team.filter((m) => m.status === 'busy' || m.status === 'at_capacity').length,
    overloaded: team.filter((m) => m.status === 'overloaded').length,
    totalTasks: taskCounts.reduce((sum, count) => sum + count, 0),
    avgTasks: safeAverage(taskCounts),
  };
}

export function useTeamStatus(options: UseTeamStatusOptions = {}): UseTeamStatusReturn {
  const { team: propTeam } = options;
  const overviewData = useOverviewData();

  const team = useMemo<readonly TeamMember[]>(() => {
    // Priority: server data > prop data > mock data
    if (overviewData?.teamStatus?.length) {
      return overviewData.teamStatus.map(
        (member): TeamMember => ({
          id: member.id,
          name: member.name,
          role: 'Team Member', // Server doesn't provide role
          image: member.image ?? undefined,
          status: normalizeStatus(member.status),
          currentProject: undefined,
          tasksInProgress: Math.max(0, member.activeTasks), // Ensure non-negative
        })
      );
    }

    return propTeam ?? MOCK_TEAM;
  }, [overviewData?.teamStatus, propTeam]);

  const stats = useMemo(() => calculateStats(team), [team]);

  return {
    team,
    stats,
    isEmpty: team.length === 0,
  };
}
