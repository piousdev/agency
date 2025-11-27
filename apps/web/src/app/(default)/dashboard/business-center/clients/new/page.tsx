import Link from 'next/link';
import { redirect } from 'next/navigation';


import { IconArrowLeft } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/session';

import { NewClientForm } from './form';

/**
 * New Client Page
 *
 * Create a new client in the business center
 */

export const metadata = {
  title: 'New Client | Business Center',
  description: 'Create a new client',
};

export default async function NewClientPage() {
  // Server-side authentication
  const user = await requireUser();

  // Check if user is internal
  if (!user.isInternal) {
    redirect('/dashboard');
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/dashboard/business-center/clients">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Client</h1>
        <p className="text-muted-foreground mt-2">Add a new client organization</p>
      </div>

      {/* Form */}
      <NewClientForm />
    </div>
  );
}
