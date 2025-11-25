import { redirect } from 'next/navigation';
import { OverviewDashboard } from '@/components/dashboard/business-center/overview';
import { getOverviewData } from '@/lib/actions/business-center/overview';
import { requireUser } from '@/lib/auth/session';

import { getUserRole } from '@/lib/api/users/get-role';

/**
 * Business Center page - internal users only
 */
export default async function BusinessCenterPage() {
  const user = await requireUser();

  if (!user.isInternal) redirect('/dashboard');

  const [userRole, overviewData] = await Promise.all([
    getUserRole(user.id),
    getOverviewData(user.id),
  ]);

  return (
    <OverviewDashboard
      userId={user.id}
      userName={user.name ?? undefined}
      userRole={userRole}
      initialData={overviewData}
    />
  );
}
