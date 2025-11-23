import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { listClients } from '@/lib/api/clients';
import { ClientsClient } from './client';

export const metadata = {
  title: 'Clients | Business Center',
  description: 'Manage your clients',
};

export default async function ClientsPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // Fetch all clients (including inactive for filtering)
  const clientsResponse = await listClients(false);

  // Separate active and inactive
  const activeClients = clientsResponse.data.filter((c) => c.active);

  return <ClientsClient clients={activeClients} allClients={clientsResponse.data} />;
}
