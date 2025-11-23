'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import {
  IconDots,
  IconExternalLink,
  IconArchive,
  IconRotate2,
  IconFileText,
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
import type { ProjectWithRelations, Project } from '@/lib/api/projects/types';

interface CompletedTableViewProps {
  projects: ProjectWithRelations[];
}

type ClientType = 'creative' | 'software' | 'full_service' | 'one_time';

const typeVariants: Record<ClientType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  creative: 'default',
  software: 'secondary',
  full_service: 'outline',
  one_time: 'outline',
};

const typeLabels: Record<ClientType, string> = {
  creative: 'Content',
  software: 'Software',
  full_service: 'Full Service',
  one_time: 'One Time',
};

export function CompletedTableView({ projects }: CompletedTableViewProps) {
  const router = useRouter();
  const [orderedProjects, setOrderedProjects] = useState(projects);

  const handleRowOrderChange = (newRowIdOrder: string[]) => {
    setOrderedProjects((prev) => {
      // Create a map for O(1) lookup of items by ID
      const itemMap = new Map(prev.map((item) => [item.id, item]));

      // Reorder items to match the new ID order
      const reordered = newRowIdOrder
        .map((id) => itemMap.get(id))
        .filter((item): item is ProjectWithRelations => item !== undefined);

      // Preserve any items not in the new order (shouldn't happen, but safe)
      const reorderedIds = new Set(newRowIdOrder);
      const remaining = prev.filter((item) => !reorderedIds.has(item.id));

      return [...reordered, ...remaining];
    });
  };

  const columns: ColumnDef<ProjectWithRelations>[] = [
    {
      accessorKey: 'name',
      header: 'Project',
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate" title={row.original.name}>
          {row.original.name}
        </div>
      ),
      meta: {
        displayName: 'Project Name',
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
      accessorKey: 'client.type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.client?.type as ClientType | undefined;
        if (!type) return <span className="text-muted-foreground">N/A</span>;
        return <Badge variant={typeVariants[type]}>{typeLabels[type]}</Badge>;
      },
      filterFn: (row, id, value: string[]) => {
        if (!value?.length) return true;
        const type = row.original.client?.type;
        return type ? value.includes(type) : false;
      },
      meta: {
        displayName: 'Project Type',
        filterType: 'multi-select',
        filterOptions: Object.entries(typeLabels).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      accessorKey: 'assignees',
      header: 'Team',
      enableSorting: false,
      cell: ({ row }) => {
        const assignees = row.original.assignees;
        if (!assignees?.length) {
          return <span className="text-muted-foreground text-sm">No team</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {assignees.slice(0, 2).map((assignee) => (
              <Badge
                key={assignee.id}
                variant="outline"
                className="text-xs truncate max-w-[80px]"
                title={assignee.name}
              >
                {assignee.name}
              </Badge>
            ))}
            {assignees.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{assignees.length - 2}
              </Badge>
            )}
          </div>
        );
      },
      meta: {
        displayName: 'Team Members',
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
      sortingFn: 'datetime',
      meta: {
        displayName: 'Created Date',
        filterType: 'date',
      },
    },
    {
      accessorKey: 'deliveredAt',
      header: 'Delivered',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.deliveredAt
            ? format(new Date(row.original.deliveredAt), 'MMM d, yyyy')
            : format(new Date(row.original.updatedAt), 'MMM d, yyyy')}
        </span>
      ),
      sortingFn: 'datetime',
      meta: {
        displayName: 'Delivery Date',
        filterType: 'date',
      },
    },
  ];

  const handleRowClick = (row: Row<ProjectWithRelations>) => {
    router.push(`/dashboard/business-center/projects/${row.original.id}`);
  };

  const renderRowActions = (row: Row<ProjectWithRelations>) => (
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
            router.push(`/dashboard/business-center/projects/${row.original.id}`);
          }}
        >
          <IconExternalLink className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Generate report
          }}
        >
          <IconFileText className="mr-2 h-4 w-4" />
          Generate Report
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Reopen project
          }}
        >
          <IconRotate2 className="mr-2 h-4 w-4" />
          Reopen Project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Archive project
          }}
        >
          <IconArchive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = () => (
    <>
      <Button variant="outline" size="sm">
        Generate Reports
      </Button>
      <Button variant="outline" size="sm">
        Export Data
      </Button>
      <Button variant="outline" size="sm">
        Archive Selected
      </Button>
    </>
  );

  if (orderedProjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No completed projects found
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={orderedProjects}
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
        enableVirtualization: orderedProjects.length > 100,
        estimatedRowHeight: 56,
        virtualTableHeight: 600,
        enableKeyboardNavigation: true,
      }}
      initialSorting={[{ id: 'deliveredAt', desc: true }]}
      onRowClick={handleRowClick}
      onRowOrderChange={handleRowOrderChange}
      renderRowActions={renderRowActions}
      renderBulkActions={renderBulkActions}
      emptyMessage="No completed projects found matching your criteria"
      tableCaption="Recently completed projects with delivery information"
      getRowId={(row) => row.id}
    />
  );
}
