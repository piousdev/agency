import { redirect } from 'next/navigation';
import { OverviewDashboard } from '@/components/dashboard/business-center/overview/overview-dashboard';
import { getOverviewData } from '@/lib/actions/business-center/overview';
import { requireUser } from '@/lib/auth/session';

/**
 * Business Center Overview - Internal Users Only
 *
 * Role-based customizable dashboard with drag-and-drop widgets.
 * Server component handles auth and data fetching, client component handles interactivity.
 */
export default async function BusinessCenterPage() {
  const user = await requireUser();

  // Only internal users can access the business center
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // Default role for dashboard layout (can be enhanced with actual role fetching)
  const userRole = 'developer';

  // Fetch all overview data server-side
  const overviewData = await getOverviewData(user.id);

  return (
    <OverviewDashboard
      userId={user.id}
      userName={user.name || undefined}
      userRole={userRole}
      initialData={overviewData}
    />
  );
}
