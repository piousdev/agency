import { OverviewDashboard } from '@/components/default/dashboard/business-center/overview';
import { getOverviewData } from '@/lib/actions/business-center/overview';
import { requireInternalUser } from '@/lib/auth/session';

/**
 * Next.js Server Component: Fetches the current session user and overview data, then passes them to the OverviewDashboard component.
 *
 * @returns {Promise<React.JSX.Element>} The rendered dashboard page for internals ONLY.
 */
export default async function OverviewDashboardPage(): Promise<React.JSX.Element> {
  const user = await requireInternalUser();
  const overviewData = await getOverviewData(user);

  return (
    <OverviewDashboard
      userId={user.id}
      userName={user.name}
      userRole={user.role}
      initialData={overviewData}
      data-testid="overview-dashboard-page"
    />
  );
}
