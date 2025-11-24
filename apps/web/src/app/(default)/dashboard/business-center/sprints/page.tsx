import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { listAllSprints } from '@/lib/api/sprints';
import { listProjects } from '@/lib/api/projects/list';
import { SprintsClient } from './client';

export default async function SprintsPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  const [sprintsResponse, projectsResponse] = await Promise.all([
    listAllSprints(),
    listProjects({ pageSize: 100 }),
  ]);

  const sprints = sprintsResponse.success ? sprintsResponse.data : [];
  const projects = projectsResponse.success ? projectsResponse.data : [];

  return <SprintsClient sprints={sprints} projects={projects} canEdit={user.isInternal} />;
}
