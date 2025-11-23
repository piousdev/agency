'use client';

import {
  IconCircleCheck,
  IconDots,
  IconExternalLink,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { TicketBulkActions } from '@/components/business-center/bulk-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  TicketPriority,
  TicketStatus,
  TicketType,
  TicketWithRelations,
} from '@/lib/api/tickets/types';

interface IntakeTableViewProps {
  tickets: TicketWithRelations[];
  users?: { id: string; name: string }[];
  onSuccess?: () => void;
}

const statusVariants: Record<TicketStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'default',
  in_progress: 'default',
  pending_client: 'outline',
  resolved: 'secondary',
  closed: 'secondary',
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_client: 'Pending Client',
  resolved: 'Resolved',
  closed: 'Closed',
};

const priorityVariants: Record<
  TicketPriority,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  critical: 'destructive',
  high: 'default',
  medium: 'secondary',
  low: 'outline',
};

const priorityLabels: Record<TicketPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const typeLabels: Record<TicketType, string> = {
  intake: 'Intake',
  bug: 'Bug',
  support: 'Support',
  incident: 'Incident',
  change_request: 'Change Request',
};

export function IntakeTableView({ tickets, users = [], onSuccess }: IntakeTableViewProps) {
  const router = useRouter();
  const [orderedTickets, setOrderedTickets] = useState(tickets);

  // Sync orderedTickets when tickets prop changes (from filtering or after bulk operations)
  useEffect(() => {
    setOrderedTickets(tickets);
  }, [tickets]);

  const handleRowOrderChange = (newRowIdOrder: string[]) => {
    setOrderedTickets((prev) => {
      // Create a map for O(1) lookup of items by ID
      const itemMap = new Map(prev.map((item) => [item.id, item]));

      // Reorder items to match the new ID order
      const reordered = newRowIdOrder
        .map((id) => itemMap.get(id))
        .filter((item): item is TicketWithRelations => item !== undefined);

      // Preserve any items not in the new order (shouldn't happen, but safe)
      const reorderedIds = new Set(newRowIdOrder);
      const remaining = prev.filter((item) => !reorderedIds.has(item.id));

      return [...reordered, ...remaining];
    });
  };

  const columns: ColumnDef<TicketWithRelations>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium max-w-[250px] truncate" title={row.original.title}>
          {row.original.title}
        </div>
      ),
      meta: {
        displayName: 'Title',
      },
    },
    {
      accessorKey: 'client.name',
      header: 'Client',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.original.client?.name}>
          {row.original.client?.name || 'N/A'}
        </div>
      ),
      meta: {
        displayName: 'Client',
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{typeLabels[row.original.type]}</Badge>,
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Type',
        filterType: 'multi-select',
        filterOptions: Object.entries(typeLabels).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority;
        return <Badge variant={priorityVariants[priority]}>{priorityLabels[priority]}</Badge>;
      },
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Priority',
        filterType: 'multi-select',
        filterOptions: Object.entries(priorityLabels).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
      },
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Status',
        filterType: 'multi-select',
        filterOptions: Object.entries(statusLabels).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </span>
      ),
      sortingFn: 'datetime',
      meta: {
        displayName: 'Created Date',
        filterType: 'date',
      },
    },
    {
      accessorKey: 'assignedTo.name',
      header: 'Assigned To',
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate">
          {row.original.assignedTo?.name || (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
      meta: {
        displayName: 'Assigned To',
      },
    },
  ];

  const handleRowClick = (row: Row<TicketWithRelations>) => {
    router.push(`/dashboard/business-center/intake-queue/${row.original.id}`);
  };

  const renderRowActions = (row: Row<TicketWithRelations>) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDots className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/business-center/intake-queue/${row.original.id}`);
          }}
        >
          <IconExternalLink className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement assign functionality
          }}
        >
          <IconUserPlus className="mr-2 h-4 w-4" />
          Assign
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement resolve functionality
          }}
        >
          <IconCircleCheck className="mr-2 h-4 w-4" />
          Mark Resolved
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement delete/close functionality
          }}
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Close Ticket
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = (table: Table<TicketWithRelations>) => (
    <TicketBulkActions table={table} users={users} onSuccess={onSuccess} />
  );

  if (orderedTickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No intake tickets found
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={orderedTickets}
      config={{
        enableRowSelection: 'multi',
        enableColumnVisibility: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enableColumnResizing: true,
        enableSorting: true,
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableRowOrdering: true,
        enableVirtualization: orderedTickets.length > 100,
        estimatedRowHeight: 56,
        virtualTableHeight: 600,
        enableKeyboardNavigation: true,
      }}
      initialSorting={[{ id: 'createdAt', desc: true }]}
      onRowClick={handleRowClick}
      onRowOrderChange={handleRowOrderChange}
      renderRowActions={renderRowActions}
      renderBulkActions={renderBulkActions}
      emptyMessage="No intake tickets found matching your criteria"
      tableCaption="Intake queue with ticket details and status"
      getRowId={(row) => row.id}
    />
  );
}
