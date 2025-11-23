/**
 * Invite User Page
 * Server Component for the invitation creation interface
 * Protected route - requires internal team member access
 */

import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/session';
import { InviteForm } from './form';

export const metadata = {
  title: 'Invite User | Admin',
  description: 'Send an invitation to a new user',
};

export default async function InviteUserPage() {
  // Layer 2: Server-side authentication and authorization
  await requireRole('internal');

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/apps/web/src/app/(auth)/admin/users">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Invite User</h1>
        <p className="text-muted-foreground mt-2">
          Send an invitation to a new user to join the platform
        </p>
      </div>

      {/* Invitation form */}
      <InviteForm />
    </div>
  );
}
