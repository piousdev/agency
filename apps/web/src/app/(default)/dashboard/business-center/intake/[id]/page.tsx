import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { RequestDetailClient } from '@/components/default/dashboard/business-center/intake/request-detail-client';
import { getTeamStatus } from '@/lib/actions/business-center/overview';
import { getRequest } from '@/lib/actions/business-center/requests';
import { requireAuth } from '@/lib/auth/session';

export const metadata = {
  title: 'Request Details - Intake Pipeline',
  description: 'View request details',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 animate-pulse rounded-lg border bg-muted" />
          <div className="h-48 animate-pulse rounded-lg border bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-lg border bg-muted" />
          <div className="h-32 animate-pulse rounded-lg border bg-muted" />
        </div>
      </div>
    </div>
  );
}

async function RequestDetailData({ id }: { id: string }) {
  const [result, teamMembers] = await Promise.all([getRequest(id), getTeamStatus()]);

  if (!result.success) {
    notFound();
  }

  const availablePMs = teamMembers.map((member) => ({
    id: member.id,
    name: member.name,
  }));

  return <RequestDetailClient request={result.data} availablePMs={availablePMs} />;
}

export default async function RequestDetailPage({ params }: PageProps) {
  await requireAuth();

  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DetailSkeleton />}>
        <RequestDetailData id={id} />
      </Suspense>
    </div>
  );
}
