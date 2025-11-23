import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { listClients } from '@/lib/api/clients';
import { listTeamMembers } from '@/lib/api/users';
import { TicketForm } from '@/components/business-center/forms';
import { createTicketAction } from '@/lib/actions/business-center/tickets';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

/**
 * New Ticket Page
 *
 * Create a new intake ticket/request
 */

export const metadata = {
  title: 'New Ticket | Business Center',
  description: 'Create a new intake ticket',
};

export default async function NewTicketPage() {
  // Server-side authentication
  const user = await requireUser();

  // Check if user is internal
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // Fetch clients and team members in parallel
  const [clientsResponse, teamResponse] = await Promise.all([listClients(true), listTeamMembers()]);

  // Transform data for form selects
  const clients = clientsResponse.data.map((client) => ({
    id: client.id,
    name: client.name,
    type: client.type,
  }));

  const users = teamResponse.data.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    image: member.image,
    capacityPercentage: member.capacityPercentage,
  }));

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/business-center/intake-queue">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Intake Queue
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Ticket</h1>
        <p className="text-muted-foreground mt-2">Create a new intake request or support ticket</p>
      </div>

      {/* Form */}
      <TicketForm clients={clients} users={users} mode="create" onSubmit={createTicketAction} />
    </div>
  );
}
