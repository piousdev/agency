import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { getRequest } from '@/lib/actions/business-center/requests';
import { listProjects } from '@/lib/api/projects/list';
import { RoutingForm } from '@/components/dashboard/business-center/intake/routing-form';

export const metadata = {
  title: 'Convert Request - Intake Pipeline',
  description: 'Convert request to project or ticket',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function ConvertSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-lg border bg-muted" />
    </div>
  );
}

async function ConvertData({ id }: { id: string }) {
  const [requestResult, projectsResult] = await Promise.all([getRequest(id), listProjects({})]);

  if (!requestResult.success || !requestResult.data) {
    notFound();
  }

  const request = requestResult.data;

  // Redirect if request is not ready or already converted
  if (request.stage !== 'ready') {
    redirect(`/dashboard/business-center/intake/${id}`);
  }

  if (request.isConverted || request.isCancelled) {
    redirect(`/dashboard/business-center/intake/${id}`);
  }

  // Must have estimation to convert
  if (request.storyPoints === null || request.storyPoints === undefined) {
    redirect(`/dashboard/business-center/intake/${id}/estimate`);
  }

  const projects = projectsResult.success ? projectsResult.data : [];

  return <RoutingForm request={request} availableProjects={projects} />;
}

export default async function ConvertPage({ params }: PageProps) {
  await requireAuth();

  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ConvertSkeleton />}>
        <ConvertData id={id} />
      </Suspense>
    </div>
  );
}
