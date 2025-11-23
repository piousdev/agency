import { redirect } from 'next/navigation';
import Link from 'next/link';
import { IconChevronLeft } from '@tabler/icons-react';
import { requireUser } from '@/lib/auth/session';
import { listClients } from '@/lib/api/clients';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects';

export default async function NewProjectPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  const clientsResponse = await listClients();

  return (
    <div className="container mx-auto max-w-full overflow-hidden py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconChevronLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to create a new project
        </p>
      </div>

      {/* Form */}
      <ProjectForm clients={clientsResponse.data} mode="create" />
    </div>
  );
}
