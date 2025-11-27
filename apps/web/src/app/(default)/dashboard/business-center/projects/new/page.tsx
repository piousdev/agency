import Link from 'next/link';
import { redirect } from 'next/navigation';

import { IconArrowLeft } from '@tabler/icons-react';

import { ProjectForm } from '@/components/business-center/forms';
import { Button } from '@/components/ui/button';
import { listClients } from '@/lib/api/clients';
import { requireUser } from '@/lib/auth/session';

/**
 * New Project Page
 *
 * Create a new project in the business center
 */

export const metadata = {
  title: 'New Project | Business Center',
  description: 'Create a new project',
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const validStatuses = [
  'proposal',
  'in_development',
  'in_review',
  'delivered',
  'on_hold',
  'maintenance',
  'archived',
];

export default async function NewProjectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const defaultStatus = validStatuses.includes(params.status) ? params.status : undefined;
  // Server-side authentication
  const user = await requireUser();

  // Check if user is internal
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // Fetch clients
  const clientsResponse = await listClients(true);

  // Transform data for form selects
  const clients = clientsResponse.data.map((client) => ({
    id: client.id,
    name: client.name,
    type: client.type,
  }));

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/business-center/projects">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        <p className="text-muted-foreground mt-2">Create a new project for a client</p>
      </div>

      {/* Form */}
      <ProjectForm
        clients={clients}
        mode="create"
        defaultStatus={defaultStatus}
        redirectPath="/dashboard/business-center/projects"
      />
    </div>
  );
}
