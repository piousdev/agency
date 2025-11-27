import { Suspense } from 'react';

import { unstable_noStore as noStore } from 'next/cache';

import { IntakeClient } from '@/components/default/dashboard/business-center/intake/intake-client';
import { Skeleton } from '@/components/ui/skeleton';
import { getTeamStatus } from '@/lib/actions/business-center/overview';
import { listRequests, getStageCounts } from '@/lib/actions/business-center/requests';
import { requireAuth } from '@/lib/auth/session';

export const metadata = {
  title: 'Intake Pipeline - Business Center',
  description: 'Manage incoming work requests through the intake pipeline',
};

async function IntakeData() {
  const [requestsResult, stageCountsResult, teamMembers] = await Promise.all([
    listRequests({ isConverted: false, isCancelled: false }),
    getStageCounts(),
    getTeamStatus(),
  ]);

  const requests = requestsResult.success ? requestsResult.data.requests : [];
  const stageCounts = stageCountsResult.success
    ? stageCountsResult.data
    : { in_treatment: 0, on_hold: 0, estimation: 0, ready: 0 };

  // Map team members to available PMs
  const availablePMs = teamMembers.map((member) => ({
    id: member.id,
    name: member.name,
  }));

  return (
    <IntakeClient
      initialRequests={requests}
      initialStageCounts={stageCounts}
      availablePMs={availablePMs}
    />
  );
}

function IntakeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stage tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function IntakePage() {
  noStore();
  await requireAuth();

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<IntakeSkeleton />}>
        <IntakeData />
      </Suspense>
    </div>
  );
}
