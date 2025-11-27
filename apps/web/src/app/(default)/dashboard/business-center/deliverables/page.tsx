import { redirect } from 'next/navigation';

import { listProjects } from '@/lib/api/projects/list';
import { listTeamMembers } from '@/lib/api/users/team';
import { requireUser } from '@/lib/auth/session';

import { DeliverablesClient } from './client';

export default async function DeliverablesPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  const [projectsResponse, teamResponse] = await Promise.all([
    listProjects({ pageSize: 100 }),
    listTeamMembers(),
  ]);

  // Filter projects that have delivery dates (upcoming or past)
  const projectsWithDelivery = projectsResponse.data.filter((p) => p.deliveredAt !== null);

  // Also include projects without delivery dates that are active (for planning)
  const activeProjectsWithoutDelivery = projectsResponse.data.filter(
    (p) => p.deliveredAt === null && p.status !== 'delivered' && p.status !== 'on_hold'
  );

  return (
    <DeliverablesClient
      projectsWithDelivery={projectsWithDelivery}
      projectsWithoutDelivery={activeProjectsWithoutDelivery}
      teamMembers={teamResponse.success ? teamResponse.data : []}
    />
  );
}
