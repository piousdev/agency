import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { listTeamMembers } from '@/lib/api/users';
import { TeamCapacityClient } from './client';

export default async function TeamCapacityPage() {
  const user = await requireUser();
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  const response = await listTeamMembers();

  return <TeamCapacityClient teamMembers={response.data} />;
}
