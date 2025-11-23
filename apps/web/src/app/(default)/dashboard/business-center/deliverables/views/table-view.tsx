'use client';

import {
  IconAlertTriangle,
  IconCalendar,
  IconDots,
  IconExternalLink,
  IconUsers,
} from '@tabler/icons-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { differenceInDays, format, isPast, isToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Progress } from '@/components/ui/progress';
import type { Project, ProjectWithRelations } from '@/lib/api/projects/types';

interface DeliverableTableViewProps {
  projects: ProjectWithRelations[];
}

type ProjectStatus = Project['status'];
type ClientType = 'creative' | 'software' | 'full_service' | 'one_time';

const statusVariants: Record<ProjectStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  proposal: 'outline',
  in_development: 'default',
  in_review: 'default',
  delivered: 'secondary',
  on_hold: 'destructive',
  maintenance: 'secondary',
  archived: 'outline',
};

const statusLabels: Record<ProjectStatus, string> = {
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
  on_hold: 'On Hold',
  maintenance: 'Maintenance',
  archived: 'Archived',
};

const typeLabels: Record<ClientType, string> = {
  creative: 'Content',
  software: 'Software',
  full_service: 'Full Service',
  one_time: 'One Time',
};

export function DeliverableTableView({ projects }: DeliverableTableViewProps) {
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
      cell: ({ row }) => {
        const isOverdue =
          row.original.deliveredAt &&
          isPast(new Date(row.original.deliveredAt)) &&
          !isToday(new Date(row.original.deliveredAt)) &&
          row.original.status !== 'delivered';

        return (
          <div className="flex items-center gap-2 max-w-[250px]">
            {isOverdue && <IconAlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
            <span className="font-medium truncate" title={row.original.name}>
              {row.original.name}
            </span>
          </div>
        );
      },
      meta: {
        displayName: 'Project Name',
      },
    },
    {
      accessorKey: 'client.type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.client?.type as ClientType | undefined;
        return (
          <Badge
            variant="outline"
            className={
              type === 'creative'
                ? 'border-pink-500 text-pink-500'
                : 'border-blue-500 text-blue-500'
            }
          >
            {type ? typeLabels[type] : 'N/A'}
          </Badge>
        );
      },
      filterFn: (row, _id, value: string[]) => {
        if (!value?.length) return true;
        const type = row.original.client?.type;
        return type ? value.includes(type) : false;
      },
      meta: {
        displayName: 'Project Type',
        filterType: 'multi-select',
        filterOptions: [
          { label: 'Content', value: 'creative' },
          { label: 'Software', value: 'software' },
        ],
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
      accessorKey: 'deliveredAt',
      header: 'Delivery Date',
      cell: ({ row }) => {
        const deliveredAt = row.original.deliveredAt;
        if (!deliveredAt) {
          return <span className="text-muted-foreground">Unscheduled</span>;
        }

        const deliveryDate = new Date(deliveredAt);
        const isOverdue =
          isPast(deliveryDate) && !isToday(deliveryDate) && row.original.status !== 'delivered';
        const daysOverdue = isOverdue ? differenceInDays(new Date(), deliveryDate) : 0;
        const isDueToday = isToday(deliveryDate);
        const daysUntil = !isPast(deliveryDate) ? differenceInDays(deliveryDate, new Date()) : null;

        return (
          <div className={isOverdue ? 'text-destructive' : ''}>
            <div>{format(deliveryDate, 'MMM d, yyyy')}</div>
            <div className="text-xs text-muted-foreground">
              {isOverdue ? (
                <span className="text-destructive">{daysOverdue}d overdue</span>
              ) : isDueToday ? (
                <span className="text-orange-500">Due today</span>
              ) : daysUntil !== null ? (
                `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
              ) : null}
            </div>
          </div>
        );
      },
      sortingFn: 'datetime',
      meta: {
        displayName: 'Delivery Date',
        filterType: 'date',
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
      accessorKey: 'completionPercentage',
      header: 'Progress',
      cell: ({ row }) => {
        const percentage = row.original.completionPercentage || 0;
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={percentage} className="h-2 w-16" />
            <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
          </div>
        );
      },
      sortingFn: 'basic',
      meta: {
        displayName: 'Progress',
        filterType: 'number-range',
      },
    },
    {
      accessorKey: 'assignees',
      header: 'Team',
      enableSorting: false,
      cell: ({ row }) => {
        const assignees = row.original.assignees;
        if (!assignees?.length) {
          return <span className="text-muted-foreground text-sm">Unassigned</span>;
        }

        return (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {assignees.slice(0, 3).map((assignee) => (
                <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={assignee.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {assignee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {assignees.length > 3 && (
              <span className="text-xs text-muted-foreground">+{assignees.length - 3}</span>
            )}
          </div>
        );
      },
      meta: {
        displayName: 'Team Members',
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
            // TODO: Set delivery date
          }}
        >
          <IconCalendar className="mr-2 h-4 w-4" />
          Set Delivery Date
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/business-center/projects/${row.original.id}/team`);
          }}
        >
          <IconUsers className="mr-2 h-4 w-4" />
          Manage Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = () => (
    <>
      <Button variant="outline" size="sm">
        Change Status
      </Button>
      <Button variant="outline" size="sm">
        Set Delivery Date
      </Button>
      <Button variant="outline" size="sm">
        Assign Team
      </Button>
    </>
  );

  if (orderedProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <IconCalendar className="h-12 w-12 mb-4" />
        <p>No deliverables found matching your criteria</p>
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
      initialSorting={[{ id: 'deliveredAt', desc: false }]}
      onRowClick={handleRowClick}
      onRowOrderChange={handleRowOrderChange}
      renderRowActions={renderRowActions}
      renderBulkActions={renderBulkActions}
      emptyMessage="No deliverables found matching your criteria"
      tableCaption="Deliverables with delivery dates and progress"
      getRowId={(row) => row.id}
    />
  );
}
