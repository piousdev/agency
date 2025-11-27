import { Suspense } from 'react';

import { notFound, redirect } from 'next/navigation';

import { EstimationForm } from '@/components/default/dashboard/business-center/intake/estimation-form';
import { getRequest } from '@/lib/actions/business-center/requests';
import { requireAuth } from '@/lib/auth/session';

export const metadata = {
  title: 'Submit Estimation - Intake Pipeline',
  description: 'Submit estimation for request',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function EstimationSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-lg border bg-muted" />
    </div>
  );
}

async function EstimationData({ id }: { id: string }) {
  const result = await getRequest(id);

  if (!result.success) {
    notFound();
  }

  const request = result.data;

  // Redirect if request is not in estimation stage or already estimated
  if (request.stage !== 'estimation') {
    redirect(`/dashboard/business-center/intake/${id}`);
  }

  if (request.isConverted || request.isCancelled) {
    redirect(`/dashboard/business-center/intake/${id}`);
  }

  return <EstimationForm request={request} />;
}

export default async function EstimatePage({ params }: PageProps) {
  await requireAuth();

  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<EstimationSkeleton />}>
        <EstimationData id={id} />
      </Suspense>
    </div>
  );
}
