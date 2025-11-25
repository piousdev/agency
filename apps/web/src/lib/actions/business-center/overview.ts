'use server';

/**
 * Overview Dashboard Data Fetching
 * Optimized for Next.js 16 with Cache Components
 *
 * Note: Most functions cannot use 'use cache' because they depend on
 * authenticated API calls that internally use headers()/cookies().
 * Caching should be added after API clients are refactored to accept
 * auth headers as parameters.
 */

import { cacheLife, cacheTag } from 'next/cache';
import { headers } from 'next/headers';
import { listTickets } from '@/lib/api/tickets/list';
import { listSprints } from '@/lib/api/sprints';
import type { TicketWithRelations, TicketStatus, TicketPriority } from '@/lib/api/tickets/types';
import type { SprintWithProject } from '@/lib/api/sprints/types';

// ============================================================================
// Types
// ============================================================================

export interface MyWorkTask {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  dueAt: string | null;
  projectName: string | null;
  ticketNumber: string | null;
  isBlocked: boolean;
  estimatedTime: number | null;
}

export interface SprintData {
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
  plannedPoints: number;
  completedPoints: number;
}

export interface BlockerItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  projectName: string;
  daysBlocked: number;
  assignee?: string;
  reason?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor: {
    name: string;
    image: string | null;
  };
  entityType: string;
  entityName: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  type: 'task' | 'project' | 'milestone';
  projectName: string | null;
  priority: TicketPriority;
}

export interface TeamMember {
  id: string;
  name: string;
  image: string | null;
  status: 'available' | 'busy' | 'away' | 'overloaded';
  activeTasks: number;
  completedToday: number;
}

export interface OrganizationMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  status: 'good' | 'warning' | 'critical';
}

export interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  format: 'currency' | 'number' | 'percent';
}

export interface FinancialSnapshot {
  revenue: FinancialMetric;
  outstanding: FinancialMetric;
  overdue: FinancialMetric;
  paidThisMonth: FinancialMetric;
  projectBudgetUsed: number;
  projectBudgetTotal: number;
}

export interface RiskIndicator {
  id: string;
  category: 'schedule' | 'budget' | 'scope' | 'resource' | 'quality';
  projectId: string;
  projectName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  mitigation?: string;
  createdAt: string;
}

export interface RiskSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  risks: RiskIndicator[];
}

export interface OverviewData {
  myWork: MyWorkTask[];
  sprint: SprintData | null;
  blockers: BlockerItem[];
  recentActivity: ActivityItem[];
  deadlines: DeadlineItem[];
  teamStatus: TeamMember[];
  orgHealth: OrganizationMetric[];
  financialSnapshot: FinancialSnapshot | null;
  riskSummary: RiskSummary | null;
}

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthToken(): Promise<string | undefined> {
  const headersList = await headers();
  const cookie = headersList.get('cookie') || '';
  const match = cookie.match(/better-auth\.session_token=([^;]+)/);
  return match?.[1];
}

// ============================================================================
// Data Fetchers
// ============================================================================

/**
 * Get user's assigned tasks
 * Cannot use 'use cache' - listTickets internally uses cookies()
 */
export async function getMyWorkToday(userId: string): Promise<MyWorkTask[]> {
  try {
    const [openTickets, inProgressTickets] = await Promise.all([
      listTickets({
        assignedToId: userId,
        status: 'open' as TicketStatus,
        pageSize: 10,
        sortBy: 'priority',
        sortOrder: 'desc',
      }),
      listTickets({
        assignedToId: userId,
        status: 'in_progress' as TicketStatus,
        pageSize: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
    ]);

    const allTickets = [...openTickets.data, ...inProgressTickets.data];

    return allTickets.slice(0, 10).map((ticket: TicketWithRelations) => ({
      id: ticket.id,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      dueAt: ticket.dueAt,
      projectName: ticket.project?.name ?? null,
      ticketNumber: ticket.ticketNumber,
      isBlocked: ticket.slaStatus === 'breached',
      estimatedTime: ticket.estimatedTime,
    }));
  } catch (error) {
    console.error('Failed to fetch my work:', error);
    return [];
  }
}

/**
 * Get current sprint
 * Cannot use 'use cache' - listSprints internally uses cookies()
 */
export async function getCurrentSprint(): Promise<SprintData | null> {
  try {
    const response = await listSprints(undefined, { status: 'active' });

    if (!response.success || response.data.length === 0) {
      return null;
    }

    const sprint = response.data[0] as SprintWithProject;

    const now = new Date();
    const endDate = sprint.endDate ? new Date(sprint.endDate) : null;
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const totalTasks = sprint.plannedPoints;
    const completedTasks = sprint.completedPoints;
    const inProgressTasks = Math.floor((totalTasks - completedTasks) * 0.3);
    const blockedTasks = 0;

    return {
      id: sprint.id,
      name: sprint.name,
      projectName: sprint.project?.name ?? 'Unknown Project',
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      daysRemaining,
      plannedPoints: sprint.plannedPoints,
      completedPoints: sprint.completedPoints,
    };
  } catch (error) {
    console.error('Failed to fetch current sprint:', error);
    return null;
  }
}

/**
 * Get blocked tasks
 * Cannot use 'use cache' - listTickets internally uses cookies()
 */
export async function getBlockers(): Promise<BlockerItem[]> {
  try {
    const [criticalTickets, highPriorityTickets] = await Promise.all([
      listTickets({
        priority: 'critical',
        pageSize: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
      listTickets({
        priority: 'high',
        pageSize: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
    ]);

    const allTickets = [...criticalTickets.data, ...highPriorityTickets.data];

    const blockedTickets = allTickets.filter(
      (t) => t.slaStatus === 'breached' || t.status === 'pending_client'
    );

    return blockedTickets.slice(0, 5).map((ticket: TicketWithRelations) => {
      const createdDate = new Date(ticket.createdAt);
      const now = new Date();
      const daysBlocked = Math.ceil(
        (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: ticket.id,
        title: ticket.title,
        severity: ticket.priority === 'critical' ? 'critical' : 'high',
        projectName: ticket.project?.name ?? 'No Project',
        daysBlocked,
        assignee: ticket.assignedTo?.name,
        reason: ticket.status === 'pending_client' ? 'Waiting for client' : 'SLA breached',
      };
    });
  } catch (error) {
    console.error('Failed to fetch blockers:', error);
    return [];
  }
}

/**
 * Get upcoming deadlines
 * Cannot use 'use cache' - listTickets internally uses cookies()
 */
export async function getUpcomingDeadlines(): Promise<DeadlineItem[]> {
  try {
    const response = await listTickets({
      pageSize: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const ticketsWithDueDates = response.data
      .filter((t: TicketWithRelations) => t.dueAt)
      .sort(
        (a: TicketWithRelations, b: TicketWithRelations) =>
          new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime()
      );

    return ticketsWithDueDates.slice(0, 5).map((ticket: TicketWithRelations) => ({
      id: ticket.id,
      title: ticket.title,
      dueDate: ticket.dueAt!,
      type: 'task' as const,
      projectName: ticket.project?.name ?? null,
      priority: ticket.priority,
    }));
  } catch (error) {
    console.error('Failed to fetch deadlines:', error);
    return [];
  }
}

/**
 * Get recent activity
 * Cannot use 'use cache' - listTickets internally uses cookies()
 */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    const response = await listTickets({
      pageSize: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });

    return response.data.map((ticket: TicketWithRelations) => ({
      id: `activity-${ticket.id}`,
      type: 'ticket_updated',
      description: `Ticket "${ticket.title}" was updated`,
      timestamp: ticket.updatedAt,
      actor: {
        name: ticket.createdBy.name,
        image: ticket.createdBy.image,
      },
      entityType: 'ticket',
      entityName: ticket.title,
    }));
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [];
  }
}

/**
 * Get team status
 * Cannot use 'use cache' - fetch requires auth headers
 */
export async function getTeamStatus(): Promise<TeamMember[]> {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') || '';

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/team`, {
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.slice(0, 6).map((member: Record<string, unknown>) => ({
      id: member.id as string,
      name: member.name as string,
      image: (member.image as string) ?? null,
      status: 'available' as const,
      activeTasks: 0,
      completedToday: 0,
    }));
  } catch (error) {
    console.error('Failed to fetch team status:', error);
    return [];
  }
}

/**
 * Get organization health metrics
 * Cannot use 'use cache' - listTickets internally uses cookies()
 */
export async function getOrganizationHealth(): Promise<OrganizationMetric[]> {
  try {
    const [openTickets, resolvedTickets, criticalTickets] = await Promise.all([
      listTickets({ status: 'open', pageSize: 1 }),
      listTickets({ status: 'resolved', pageSize: 1 }),
      listTickets({ priority: 'critical', pageSize: 1 }),
    ]);

    const totalOpen = openTickets.pagination?.totalCount ?? 0;
    const totalResolved = resolvedTickets.pagination?.totalCount ?? 0;
    const totalCritical = criticalTickets.pagination?.totalCount ?? 0;

    return [
      {
        id: 'open-tickets',
        label: 'Open Tickets',
        value: totalOpen,
        change: 0,
        trend: 'neutral',
        status: totalOpen > 20 ? 'warning' : 'good',
      },
      {
        id: 'resolved-today',
        label: 'Resolved',
        value: totalResolved,
        change: 0,
        trend: 'up',
        status: 'good',
      },
      {
        id: 'critical-issues',
        label: 'Critical',
        value: totalCritical,
        change: 0,
        trend: totalCritical > 0 ? 'down' : 'neutral',
        status: totalCritical > 0 ? 'critical' : 'good',
      },
      {
        id: 'team-utilization',
        label: 'Utilization',
        value: 75,
        change: 5,
        trend: 'up',
        status: 'good',
      },
    ];
  } catch (error) {
    console.error('Failed to fetch org health:', error);
    return [];
  }
}

/**
 * Get financial snapshot
 * Can use 'use cache' - no external API calls, pure mock data
 */
export async function getFinancialSnapshot(): Promise<FinancialSnapshot | null> {
  'use cache';
  cacheLife('days');
  cacheTag('financial-snapshot');

  try {
    // TODO: Replace with actual API when billing service exists
    return {
      revenue: {
        id: 'revenue',
        label: 'Monthly Revenue',
        value: 45250,
        change: 12,
        trend: 'up',
        format: 'currency',
      },
      outstanding: {
        id: 'outstanding',
        label: 'Outstanding',
        value: 12500,
        change: -5,
        trend: 'down',
        format: 'currency',
      },
      overdue: {
        id: 'overdue',
        label: 'Overdue',
        value: 3200,
        change: 8,
        trend: 'up',
        format: 'currency',
      },
      paidThisMonth: {
        id: 'paid',
        label: 'Paid This Month',
        value: 32750,
        change: 15,
        trend: 'up',
        format: 'currency',
      },
      projectBudgetUsed: 67500,
      projectBudgetTotal: 100000,
    };
  } catch (error) {
    console.error('Failed to fetch financial snapshot:', error);
    return null;
  }
}

/**
 * Get risk summary
 * Can use 'use cache' - no external API calls, pure mock data
 */
export async function getRiskSummary(): Promise<RiskSummary | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('risk-summary');

  try {
    // TODO: Replace with actual API when risk assessment service exists
    const risks: RiskIndicator[] = [
      {
        id: 'risk-1',
        category: 'schedule',
        projectId: 'proj-1',
        projectName: 'Acme Website Redesign',
        severity: 'high',
        description: 'Sprint velocity below target for 2 consecutive sprints',
        impact: 'May miss Q1 deadline',
        mitigation: 'Adding additional developer resource',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'risk-2',
        category: 'budget',
        projectId: 'proj-2',
        projectName: 'TechCorp Mobile App',
        severity: 'medium',
        description: 'Budget utilization at 85% with 30% work remaining',
        impact: 'Potential budget overrun of 15-20%',
        mitigation: 'Scope review scheduled with client',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'risk-3',
        category: 'resource',
        projectId: 'proj-1',
        projectName: 'Acme Website Redesign',
        severity: 'low',
        description: 'Key developer on PTO next week',
        impact: 'Minor delay in API integration',
        createdAt: new Date().toISOString(),
      },
    ];

    return {
      total: risks.length,
      critical: risks.filter((r) => r.severity === 'critical').length,
      high: risks.filter((r) => r.severity === 'high').length,
      medium: risks.filter((r) => r.severity === 'medium').length,
      low: risks.filter((r) => r.severity === 'low').length,
      risks,
    };
  } catch (error) {
    console.error('Failed to fetch risk summary:', error);
    return null;
  }
}

// ============================================================================
// Main Aggregator
// ============================================================================

/**
 * Aggregate all overview data
 * All fetches run in parallel for optimal performance
 */
export async function getOverviewData(userId: string): Promise<OverviewData> {
  const [
    myWork,
    sprint,
    blockers,
    recentActivity,
    deadlines,
    teamStatus,
    orgHealth,
    financialSnapshot,
    riskSummary,
  ] = await Promise.all([
    getMyWorkToday(userId),
    getCurrentSprint(),
    getBlockers(),
    getRecentActivity(),
    getUpcomingDeadlines(),
    getTeamStatus(),
    getOrganizationHealth(),
    getFinancialSnapshot(),
    getRiskSummary(),
  ]);

  return {
    myWork,
    sprint,
    blockers,
    recentActivity,
    deadlines,
    teamStatus,
    orgHealth,
    financialSnapshot,
    riskSummary,
  };
}
