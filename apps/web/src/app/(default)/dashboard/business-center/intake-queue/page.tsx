import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { listTickets } from '@/lib/api/tickets/list';
import { listTeamMembers } from '@/lib/api/users';
import { IntakeQueueClient } from './client';

/**
 * Intake Queue Page
 *
 * Displays all open intake tickets with table/card/kanban views
 */

export default async function IntakeQueuePage() {
  // Server-side authentication
  const user = await requireUser();

  // Check if user is internal
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // Fetch intake tickets and team members
  // Using Promise.allSettled to handle errors gracefully
  const [ticketsResult, teamResult] = await Promise.allSettled([
    listTickets({ type: 'intake', status: 'open' }),
    listTeamMembers(),
  ]);

  // Check for errors and throw the first one encountered
  if (ticketsResult.status === 'rejected') {
    throw ticketsResult.reason;
  }
  if (teamResult.status === 'rejected') {
    throw teamResult.reason;
  }

  const ticketsResponse = ticketsResult.value;
  const teamResponse = teamResult.value;

  return <IntakeQueueClient tickets={ticketsResponse.data} teamMembers={teamResponse.data} />;
}
