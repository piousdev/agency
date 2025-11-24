import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/session';
import { RequestFormClient } from '@/components/dashboard/business-center/intake/request-form-client';

export const metadata = {
  title: 'New Request - Intake Pipeline',
  description: 'Submit a new work request to the intake pipeline',
};

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default async function NewRequestPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <Suspense fallback={<FormSkeleton />}>
        <RequestFormClient />
      </Suspense>
    </div>
  );
}
