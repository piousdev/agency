'use client';

import { useState, useTransition } from 'react';

import {
  IconArchive,
  IconCircleCheck,
  IconCircleMinus,
  IconLoader2,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  bulkUpdateTicketStatusAction,
  bulkUpdateTicketPriorityAction,
  bulkAssignTicketsAction,
  bulkDeleteTicketsAction,
  bulkUpdateProjectStatusAction,
  bulkArchiveProjectsAction,
  bulkDeactivateClientsAction,
  bulkActivateClientsAction,
  bulkUpdateClientTypeAction,
  type BulkOperationResult,
} from '@/lib/actions/business-center/bulk';

// ============================================================================
// Client Bulk Actions Component
// ============================================================================

import type { Table } from '@tanstack/react-table';

// ============================================================================
// Types
// ============================================================================

type TicketStatus = 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

interface BulkActionsProps<TData> {
  table: Table<TData>;
  onSuccess?: () => void;
}

// Constant for default empty array to avoid re-renders
const EMPTY_USERS: { id: string; name: string }[] = [];

interface TicketBulkActionsProps<TData> extends BulkActionsProps<TData> {
  users?: { id: string; name: string }[];
}

// ============================================================================
// Labels
// ============================================================================

const ticketStatusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_client: 'Pending Client',
  resolved: 'Resolved',
  closed: 'Closed',
};

const ticketPriorityLabels: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// ============================================================================
// Helper Functions
// ============================================================================

function handleBulkResult(result: BulkOperationResult, successMessage: string) {
  if (result.success) {
    toast.success(successMessage);
  } else if (result.successCount > 0) {
    toast.warning(
      `Partially completed: ${String(result.successCount)} succeeded, ${String(result.failedCount)} failed`
    );
  } else {
    toast.error(result.error ?? 'Operation failed');
  }
}

// ============================================================================
// Ticket Bulk Actions Component
// ============================================================================

export function TicketBulkActions<TData extends { id: string }>({
  table,
  users = EMPTY_USERS,
  onSuccess,
}: TicketBulkActionsProps<TData>) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);

  const handleStatusChange = (status: TicketStatus) => {
    startTransition(async () => {
      const result = await bulkUpdateTicketStatusAction(selectedIds, status);
      handleBulkResult(
        result,
        `Updated ${String(result.successCount)} ticket(s) to "${ticketStatusLabels[status]}"`
      );
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
    });
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    startTransition(async () => {
      const result = await bulkUpdateTicketPriorityAction(selectedIds, priority);
      handleBulkResult(
        result,
        `Updated ${String(result.successCount)} ticket(s) to "${ticketPriorityLabels[priority]}" priority`
      );
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
    });
  };

  const handleAssign = (userId: string | null) => {
    startTransition(async () => {
      const result = await bulkAssignTicketsAction(selectedIds, userId);
      const message = userId
        ? `Assigned ${String(result.successCount)} ticket(s)`
        : `Unassigned ${String(result.successCount)} ticket(s)`;
      handleBulkResult(result, message);
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await bulkDeleteTicketsAction(selectedIds);
      handleBulkResult(result, `Closed ${String(result.successCount)} ticket(s)`);
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
      setDeleteDialogOpen(false);
    });
  };

  return (
    <>
      {/* Assign Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconUserPlus className="mr-2 h-4 w-4" />
            )}
            Assign
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Assign to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAssign(null)}>
            <IconCircleMinus className="mr-2 h-4 w-4" />
            Unassign
          </DropdownMenuItem>
          {users.map((user) => (
            <DropdownMenuItem key={user.id} onClick={() => handleAssign(user.id)}>
              {user.name}
            </DropdownMenuItem>
          ))}
          {users.length === 0 && (
            <DropdownMenuItem disabled>No team members available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconCircleCheck className="mr-2 h-4 w-4" />
            )}
            Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Change status to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.entries(ticketStatusLabels) as [TicketStatus, string][]).map(
            ([status, label]) => (
              <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                {label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            Priority
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Change priority to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.entries(ticketPriorityLabels) as [TicketPriority, string][]).map(
            ([priority, label]) => (
              <DropdownMenuItem key={priority} onClick={() => handlePriorityChange(priority)}>
                {label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => setDeleteDialogOpen(true)}
      >
        {isPending ? (
          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IconX className="mr-2 h-4 w-4" />
        )}
        Close Selected
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close {selectedIds.length} ticket(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the selected tickets. They will be marked as closed and moved out of
              active views.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                'Close Tickets'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type ProjectStatus =
  | 'proposal'
  | 'in_development'
  | 'in_review'
  | 'delivered'
  | 'on_hold'
  | 'maintenance'
  | 'archived';

const projectStatusLabels: Record<ProjectStatus, string> = {
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
  on_hold: 'On Hold',
  maintenance: 'Maintenance',
  archived: 'Archived',
};

export function ProjectBulkActions<TData extends { id: string }>({
  table,
  onSuccess,
}: BulkActionsProps<TData>) {
  const [isPending, startTransition] = useTransition();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);

  const handleStatusChange = (status: ProjectStatus) => {
    startTransition(async () => {
      const result = await bulkUpdateProjectStatusAction(selectedIds, status);
      handleBulkResult(
        result,
        `Updated ${String(result.successCount)} project(s) to "${projectStatusLabels[status]}"`
      );
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await bulkArchiveProjectsAction(selectedIds);
      handleBulkResult(result, `Archived ${String(result.successCount)} project(s)`);
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
      setArchiveDialogOpen(false);
    });
  };

  return (
    <>
      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconCircleCheck className="mr-2 h-4 w-4" />
            )}
            Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Change status to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.entries(projectStatusLabels) as [ProjectStatus, string][])
            .filter(([status]) => status !== 'archived') // Archive has its own button
            .map(([status, label]) => (
              <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                {label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Button */}
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => setArchiveDialogOpen(true)}
      >
        {isPending ? (
          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IconArchive className="mr-2 h-4 w-4" />
        )}
        Archive Selected
      </Button>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedIds.length} project(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected projects. They will be moved to the archived section
              and hidden from active views.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                'Archive Projects'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type ClientType = 'software' | 'creative' | 'full_service';

const clientTypeLabels: Record<ClientType, string> = {
  software: 'Software',
  creative: 'Creative',
  full_service: 'Full Service',
};

export function ClientBulkActions<TData extends { id: string }>({
  table,
  onSuccess,
}: BulkActionsProps<TData>) {
  const [isPending, startTransition] = useTransition();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);

  const handleTypeChange = (type: ClientType) => {
    startTransition(async () => {
      const result = await bulkUpdateClientTypeAction(selectedIds, type);
      handleBulkResult(
        result,
        `Updated ${String(result.successCount)} client(s) to "${clientTypeLabels[type]}"`
      );
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
    });
  };

  const handleActivate = () => {
    startTransition(async () => {
      const result = await bulkActivateClientsAction(selectedIds);
      handleBulkResult(result, `Activated ${String(result.successCount)} client(s)`);
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
    });
  };

  const handleDeactivate = () => {
    startTransition(async () => {
      const result = await bulkDeactivateClientsAction(selectedIds);
      handleBulkResult(result, `Deactivated ${String(result.successCount)} client(s)`);
      if (result.success || result.successCount > 0) {
        table.toggleAllRowsSelected(false);
        onSuccess?.();
      }
      setDeactivateDialogOpen(false);
    });
  };

  return (
    <>
      {/* Type Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Type
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Change type to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.entries(clientTypeLabels) as [ClientType, string][]).map(([type, label]) => (
            <DropdownMenuItem key={type} onClick={() => handleTypeChange(type)}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Activate Button */}
      <Button variant="outline" size="sm" disabled={isPending} onClick={handleActivate}>
        {isPending ? (
          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IconCircleCheck className="mr-2 h-4 w-4" />
        )}
        Activate
      </Button>

      {/* Deactivate Button */}
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => setDeactivateDialogOpen(true)}
      >
        {isPending ? (
          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IconCircleMinus className="mr-2 h-4 w-4" />
        )}
        Deactivate
      </Button>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {selectedIds.length} client(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the selected clients. They will be hidden from active views but
              can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate Clients'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
