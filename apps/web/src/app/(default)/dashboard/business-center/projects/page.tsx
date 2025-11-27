import { redirect } from 'next/navigation';

import { listProjects } from '@/lib/api/projects/list';
import { listTeamMembers } from '@/lib/api/users/team';
import { requireUser } from '@/lib/auth/session';

import { ProjectsClient } from './client';

export default async function ProjectsPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  const [projectsResponse, teamResponse] = await Promise.all([
    listProjects({ pageSize: 100 }),
    listTeamMembers(),
  ]);

  // Filter out delivered and on_hold projects by default (active projects)
  const activeProjects = projectsResponse.data.filter(
    (p) => p.status !== 'delivered' && p.status !== 'on_hold'
  );

  return (
    <ProjectsClient
      projects={activeProjects}
      allProjects={projectsResponse.data}
      teamMembers={teamResponse.success ? teamResponse.data : []}
    />
  );
}
