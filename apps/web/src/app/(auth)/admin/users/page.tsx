/**
 * Admin Users Page (Server Component)
 * Lists all users with pagination, filtering, and search
 *
 * Security: Requires authentication and internal team member status
 * Architecture: Server-First - data fetched on server, minimal client JavaScript
 */

import { Suspense } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { listUsers } from '@/lib/api/users';
import { requireRole } from '@/lib/auth/session';

import { UsersFilters } from './filters';
import { UsersTableSkeleton } from './skeleton';
import { UsersTable } from './table';

export const metadata = {
  title: 'User Management | Admin',
  description: 'Manage users, roles, and permissions',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    isInternal?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  // Layer 2: Real security validation
  await requireRole('internal');

  const params = await searchParams;

  // Parse query parameters
  const page = parseInt(params.page ?? '1', 10);
  const pageSize = parseInt(params.pageSize ?? '20', 10);
  const sortBy =
    (params.sortBy as 'name' | 'email' | 'createdAt' | 'updatedAt' | undefined) ?? 'createdAt';
  const sortOrder = (params.sortOrder as 'asc' | 'desc' | undefined) ?? 'desc';
  const search = params.search;
  const isInternal = (params.isInternal as 'all' | 'true' | 'false' | undefined) ?? 'all';

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button asChild>
          <Link href="/apps/web/src/app/(auth)/admin/users/invite">Invite User</Link>
        </Button>
      </div>

      {/* Filters */}
      <UsersFilters
        defaultSearch={search}
        defaultIsInternal={isInternal}
        defaultSortBy={sortBy}
        defaultSortOrder={sortOrder}
      />

      {/* Users Table with Suspense */}
      <Suspense
        key={`${String(page)}-${String(pageSize)}-${sortBy}-${sortOrder}-${search ?? ''}-${isInternal}`}
        fallback={<UsersTableSkeleton />}
      >
        <UsersTableData
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
          search={search}
          isInternal={isInternal}
        />
      </Suspense>
    </div>
  );
}

/**
 * Server Component that fetches and displays users data
 * Wrapped in Suspense for streaming
 */
async function UsersTableData({
  page,
  pageSize,
  sortBy,
  sortOrder,
  search,
  isInternal,
}: {
  page: number;
  pageSize: number;
  sortBy: 'name' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  search?: string;
  isInternal: 'all' | 'true' | 'false';
}) {
  try {
    // Fetch users server-side
    const response = await listUsers({
      page,
      pageSize,
      sortBy,
      sortOrder,
      search,
      isInternal,
    });

    return <UsersTable users={response.data} pagination={response.pagination} />;
  } catch (error) {
    return (
      <div className="border border-destructive rounded-lg p-8 text-center">
        <h3 className="font-semibold text-destructive mb-2">Failed to load users</h3>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }
}
