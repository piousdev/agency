import { useMemo } from 'react';

import { MOCK_TEAM } from '@/components/default/dashboard/business-center/overview/constants/ts-mock-data';
import { useOverviewData } from '@/components/default/dashboard/business-center/overview/context/overview-data-context';
import {
  isValidTeamMemberStatus,
  type TeamMember,
  type TeamStats,
} from '@/components/default/dashboard/business-center/overview/types';
import { safeAverage } from '@/components/default/dashboard/business-center/overview/utils/member';

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
  console.warn(`Unknown team member status: ${String(status)}`);
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

  const serverTeamStatus = overviewData?.teamStatus;

  const team = useMemo<readonly TeamMember[]>(() => {
    // Priority: server data > prop data > mock data
    if (serverTeamStatus?.length) {
      return serverTeamStatus.map(
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
  }, [serverTeamStatus, propTeam]);

  const stats = useMemo(() => calculateStats(team), [team]);

  return {
    team,
    stats,
    isEmpty: team.length === 0,
  };
}
