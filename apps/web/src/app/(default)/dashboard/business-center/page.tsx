import { redirect } from 'next/navigation';
import { listProjects } from '@/lib/api/projects/list';
import { listTickets } from '@/lib/api/tickets/list';
import { listTeamMembers } from '@/lib/api/users/team';
import { requireUser } from '@/lib/auth/session';
import { IntakeQueueHero } from './components/intake-queue-hero';
import { TeamCapacityHero } from './components/team-capacity-hero';
import { ActiveProjectsCard } from './components/active-projects-card';
import { CompletedProjectsCard } from './components/completed-projects-card';
import { DeliverablesCard } from './components/deliverables-card';
import { BusinessCenterHeader } from './components/header';

/**
 * Business Center Overview - Internal Users Only
 *
 * Bento grid layout based on importance and content density:
 * ┌──────────────┬──────────┬──────────┐
 * │ Intake Queue │  Team    │Deliveries│
 * │  (2 cols)    │ Capacity │          │
 * ├──────────────┴──────────┼──────────┤
 * │   Active Projects       │Completed │
 * │      (3 cols)           │          │
 * └─────────────────────────┴──────────┘
 */

export default async function BusinessCenterPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  let ticketsResponse: Awaited<ReturnType<typeof listTickets>>;
  let projectsResponse: Awaited<ReturnType<typeof listProjects>>;
  let teamResponse: Awaited<ReturnType<typeof listTeamMembers>>;

  try {
    [ticketsResponse, projectsResponse, teamResponse] = await Promise.all([
      listTickets({ type: 'intake', status: 'open' }),
      listProjects({ pageSize: 100 }),
      listTeamMembers(),
    ]);
  } catch (error) {
    console.error('Error fetching Business Center data:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching Business Center data');
  }

  // Intake metrics
  const intakeCount = ticketsResponse.data.length;

  // Project metrics
  const contentProjects = projectsResponse.data.filter(
    (p) => p.client.type === 'content' && p.status !== 'delivered' && p.status !== 'on_hold'
  );
  const softwareProjects = projectsResponse.data.filter(
    (p) => p.client.type === 'software' && p.status !== 'delivered' && p.status !== 'on_hold'
  );
  const completedCount = projectsResponse.data.filter((p) => p.status === 'delivered').length;

  // Team capacity metrics
  const teamCount = teamResponse.data.length;
  const availableTeam = teamResponse.data.filter((m) => m.status === 'available').length;
  const atCapacityTeam = teamResponse.data.filter((m) => m.status === 'at_capacity').length;
  const overloadedTeam = teamResponse.data.filter((m) => m.status === 'overloaded').length;

  // Deliverables metrics
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const projectsWithDelivery = projectsResponse.data.filter(
    (p) => p.deliveredAt && p.status !== 'delivered'
  );
  const overdueCount = projectsWithDelivery.filter((p) => new Date(p.deliveredAt!) < now).length;
  const thisWeekCount = projectsWithDelivery.filter((p) => {
    const deliveryDate = new Date(p.deliveredAt!);
    return deliveryDate >= now && deliveryDate <= oneWeekFromNow;
  }).length;
  const upcomingCount = projectsWithDelivery.filter((p) => new Date(p.deliveredAt!) >= now).length;

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-2rem)] animate-in fade-in duration-500 motion-reduce:animate-none">
      <BusinessCenterHeader userName={user.name || undefined} />

      {/* Bento Grid - Responsive layout */}
      {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6 min-h-0 auto-rows-[minmax(280px,1fr)]">
        {/* Row 1 - Intake Queue (featured, spans 2 cols on tablet+) */}
        <div className="md:col-span-2 min-h-[280px]">
          <IntakeQueueHero count={intakeCount} trend={{ value: 12, direction: 'up' }} />
        </div>

        {/* Team Capacity - full width on mobile, 1 col on tablet+ */}
        <div className="min-h-[280px]">
          <TeamCapacityHero
            available={availableTeam}
            atCapacity={atCapacityTeam}
            overloaded={overloadedTeam}
            total={teamCount}
          />
        </div>

        {/* Deliverables - full width on mobile, 1 col on tablet+ */}
        <div className="min-h-[280px]">
          <DeliverablesCard
            upcomingCount={upcomingCount}
            overdueCount={overdueCount}
            thisWeekCount={thisWeekCount}
          />
        </div>

        {/* Row 2 - Active Projects (spans 3 cols on xl, 2 on md) */}
        <div className="md:col-span-2 xl:col-span-3 min-h-[280px]">
          <ActiveProjectsCard
            contentCount={contentProjects.length}
            softwareCount={softwareProjects.length}
          />
        </div>

        {/* Completed Projects - full width on mobile/tablet, 1 col on xl */}
        <div className="md:col-span-2 xl:col-span-1 min-h-[280px]">
          <CompletedProjectsCard
            completedCount={completedCount}
            totalProjects={projectsResponse.data.length}
          />
        </div>
      </div>
    </div>
  );
}
