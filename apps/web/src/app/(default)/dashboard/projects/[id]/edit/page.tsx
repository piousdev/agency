import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { IconChevronLeft } from '@tabler/icons-react';
import { requireUser } from '@/lib/auth/session';
import { getProject } from '@/lib/api/projects';
import { listClients } from '@/lib/api/clients';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  let project;
  try {
    const response = await getProject(id);
    project = response.data;
  } catch {
    notFound();
  }

  const clientsResponse = await listClients();

  return (
    <div className="container mx-auto max-w-full overflow-hidden py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/projects/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <IconChevronLeft className="h-4 w-4 mr-1" />
            Back to Project
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-2">Update the project details below</p>
      </div>

      {/* Form */}
      <ProjectForm project={project} clients={clientsResponse.data} mode="edit" />
    </div>
  );
}
