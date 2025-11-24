'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { type ColumnDef, type Row, type Table } from '@tanstack/react-table';
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconExternalLink,
  IconMail,
  IconPhone,
  IconEye,
} from '@tabler/icons-react';
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
import { DataTable } from '@/components/data-table';
import { ClientBulkActions } from '@/components/business-center/bulk-actions';
import { PermissionGate, Permissions } from '@/lib/hooks/use-permissions';
import type { Client } from '@/lib/api/clients/types';
import { clientTypeOptions } from '@/lib/schemas';

interface ClientsTableViewProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onSuccess?: () => void;
}

type ClientType = Client['type'];

const typeVariants: Record<ClientType, 'default' | 'secondary' | 'outline'> = {
  software: 'default',
  creative: 'secondary',
  full_service: 'outline',
};

const typeLabels: Record<ClientType, string> = {
  software: 'Software',
  creative: 'Creative',
  full_service: 'Full Service',
};

export function ClientsTableView({ clients, onEdit, onDelete, onSuccess }: ClientsTableViewProps) {
  const [orderedClients, setOrderedClients] = useState(clients);

  // Sync orderedClients when clients prop changes (from filtering)
  useEffect(() => {
    setOrderedClients(clients);
  }, [clients]);

  const handleRowOrderChange = (newRowIdOrder: string[]) => {
    setOrderedClients((prev) => {
      const itemMap = new Map(prev.map((item) => [item.id, item]));
      const reordered = newRowIdOrder
        .map((id) => itemMap.get(id))
        .filter((item): item is Client => item !== undefined);
      const reorderedIds = new Set(newRowIdOrder);
      const remaining = prev.filter((item) => !reorderedIds.has(item.id));
      return [...reordered, ...remaining];
    });
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: 'name',
      header: 'Client',
      cell: ({ row }) => (
        <div>
          <Link
            href={`/dashboard/business-center/clients/${row.original.id}`}
            className="font-medium max-w-[200px] truncate hover:text-primary hover:underline"
            title={row.original.name}
          >
            {row.original.name}
          </Link>
          {row.original.website && (
            <a
              href={row.original.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <IconExternalLink className="h-3 w-3" />
              {new URL(row.original.website).hostname}
            </a>
          )}
        </div>
      ),
      meta: {
        displayName: 'Client Name',
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type;
        return <Badge variant={typeVariants[type]}>{typeLabels[type]}</Badge>;
      },
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Client Type',
        filterType: 'multi-select',
        filterOptions: clientTypeOptions.map(({ value, label }) => ({ label, value })),
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <IconMail className="h-3 w-3" />
          <span className="max-w-[180px] truncate">{row.original.email}</span>
        </a>
      ),
      meta: {
        displayName: 'Email',
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.original.phone;
        if (!phone) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <a
            href={`tel:${phone}`}
            className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <IconPhone className="h-3 w-3" />
            {phone}
          </a>
        );
      },
      meta: {
        displayName: 'Phone',
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        const active = row.getValue(id) as boolean;
        return value.includes(active ? 'active' : 'inactive');
      },
      meta: {
        displayName: 'Status',
        filterType: 'multi-select',
        filterOptions: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <span className="text-muted-foreground text-sm">
            {format(new Date(createdAt), 'MMM d, yyyy')}
          </span>
        );
      },
      sortingFn: 'datetime',
      meta: {
        displayName: 'Created Date',
        filterType: 'date',
      },
    },
  ];

  const renderRowActions = (row: Row<Client>) => (
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
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/business-center/clients/${row.original.id}`}>
            <IconEye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <PermissionGate permission={Permissions.CLIENT_EDIT}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
          >
            <IconPencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </PermissionGate>
        <DropdownMenuSeparator />
        <PermissionGate permission={Permissions.CLIENT_DELETE}>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            {row.original.active ? 'Deactivate' : 'Delete'}
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = (table: Table<Client>) => (
    <PermissionGate permission={Permissions.BULK_OPERATIONS}>
      <ClientBulkActions table={table} onSuccess={onSuccess} />
    </PermissionGate>
  );

  if (orderedClients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No clients found matching your criteria
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={orderedClients}
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
        enableVirtualization: orderedClients.length > 100,
        estimatedRowHeight: 56,
        virtualTableHeight: 600,
        enableKeyboardNavigation: true,
      }}
      initialSorting={[{ id: 'name', desc: false }]}
      onRowOrderChange={handleRowOrderChange}
      renderRowActions={renderRowActions}
      renderBulkActions={renderBulkActions}
      emptyMessage="No clients found matching your criteria"
      tableCaption="Clients list with contact information and status"
      getRowId={(row) => row.id}
    />
  );
}
