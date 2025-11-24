import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { listLabels } from '@/lib/api/labels';
import { IconArrowLeft, IconTag } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { LabelsClient } from './client';

export const metadata = {
  title: 'Labels | Settings | Business Center',
  description: 'Manage labels for tickets and projects',
};

export default async function LabelsSettingsPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // Fetch all labels
  const labelsResponse = await listLabels();
  const labels = labelsResponse.success ? labelsResponse.data : [];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/business-center">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Center
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <IconTag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Labels</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage labels for organizing tickets and projects
            </p>
          </div>
        </div>
      </div>

      {/* Labels Management Client Component */}
      <LabelsClient initialLabels={labels} />
    </div>
  );
}
