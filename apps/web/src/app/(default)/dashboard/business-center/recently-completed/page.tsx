import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { listProjects } from '@/lib/api/projects';
import { RecentlyCompletedClient } from './client';

export default async function RecentlyCompletedPage() {
  const user = await requireUser();
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  const response = await listProjects({ pageSize: 100 });
  const completedProjects = response.data
    .filter((p) => p.status === 'delivered')
    .sort((a, b) => {
      // Sort by deliveredAt if available, otherwise by updatedAt
      const dateA = a.deliveredAt || a.updatedAt;
      const dateB = b.deliveredAt || b.updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return <RecentlyCompletedClient projects={completedProjects} />;
}
