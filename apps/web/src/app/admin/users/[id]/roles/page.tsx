/**
 * User Roles Management Page
 * Server Component for managing roles assigned to a specific user
 * Protected route - requires internal team member access
 */

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/api/users';
import { listRoles } from '@/lib/api/users/roles';
import { requireRole } from '@/lib/auth/session';
import { AssignRoleForm } from './assign';
import { CurrentRolesList } from './list';

export const metadata = {
  title: 'Manage User Roles | Admin',
  description: 'Assign and manage roles for team members',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserRolesPage({ params }: PageProps) {
  // Layer 2: Server-side authentication and authorization
  await requireRole('internal');

  const { id: userId } = await params;

  // Fetch user data (includes current roles)
  const userResponse = await getUser(userId);

  if (!userResponse.success || !userResponse.data) {
    notFound();
  }

  const user = userResponse.data;

  // Only allow role assignment for internal team members
  if (!user.isInternal) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/admin/users/${userId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User Details
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Role Assignment Not Available
          </h2>
          <p className="text-sm text-muted-foreground">
            Role assignment is only available for internal team members. External users and clients
            cannot have custom roles assigned.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all available roles
  const rolesResponse = await listRoles({
    roleType: 'internal',
    pageSize: 100,
  });

  const availableRoles = rolesResponse.success ? rolesResponse.data : [];
  const currentRoleIds = user.roles?.map((r) => r.id) || [];

  // Filter out already assigned roles
  const unassignedRoles = availableRoles.filter((role) => !currentRoleIds.includes(role.id));

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/admin/users/${userId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Details
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Roles</h1>
        <p className="text-muted-foreground mt-2">Assign and manage roles for {user.name}</p>
        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
      </div>

      <div className="grid gap-8">
        {/* Current Roles */}
        <CurrentRolesList userId={userId} roles={user.roles || []} />

        {/* Assign New Role */}
        {unassignedRoles.length > 0 && (
          <AssignRoleForm userId={userId} availableRoles={unassignedRoles} />
        )}
      </div>
    </div>
  );
}
