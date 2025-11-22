'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { MoreHorizontal, ExternalLink, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

interface ProjectTableViewProps {
  projects: ProjectWithRelations[];
}

type ProjectStatus = Project['status'];

const statusVariants: Record<ProjectStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  intake: 'secondary',
  proposal: 'outline',
  in_development: 'default',
  in_review: 'default',
  delivered: 'secondary',
  on_hold: 'destructive',
};

const statusLabels: Record<ProjectStatus, string> = {
  intake: 'Intake',
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
  on_hold: 'On Hold',
};

export function ProjectTableView({ projects }: ProjectTableViewProps) {
  const router = useRouter();
  const [orderedProjects, setOrderedProjects] = useState(projects);

  const handleRowOrderChange = (sourceIndex: number, destIndex: number) => {
    setOrderedProjects((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(sourceIndex, 1);
      if (removed) newOrder.splice(destIndex, 0, removed);
      return newOrder;
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
      accessorKey: 'client.type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.client?.type;
        return <Badge variant="outline">{type === 'creative' ? 'Content' : type || 'N/A'}</Badge>;
      },
      meta: {
        displayName: 'Project Type',
        filterType: 'select',
        filterOptions: [
          { label: 'Content', value: 'creative' },
          { label: 'Software', value: 'software' },
          { label: 'Full Service', value: 'full_service' },
          { label: 'One Time', value: 'one_time' },
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
      accessorKey: 'deliveredAt',
      header: 'Delivery',
      cell: ({ row }) => {
        const deliveredAt = row.original.deliveredAt;
        const isOverdue =
          deliveredAt && new Date(deliveredAt) < new Date() && row.original.status !== 'delivered';

        if (!deliveredAt) {
          return <span className="text-muted-foreground">Not scheduled</span>;
        }

        return (
          <span className={isOverdue ? 'text-destructive font-medium' : ''}>
            {format(new Date(deliveredAt), 'MMM d, yyyy')}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      },
      sortingFn: 'datetime',
      meta: {
        displayName: 'Delivery Date',
        filterType: 'date',
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
          <div className="flex flex-wrap gap-1">
            {assignees.slice(0, 2).map((assignee) => (
              <Badge key={assignee.id} variant="outline" className="text-xs">
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
      meta: {
        displayName: 'Progress',
        filterType: 'number-range',
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
          <MoreHorizontal className="h-4 w-4" />
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
          <ExternalLink className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/business-center/projects/${row.original.id}/team`);
          }}
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Team
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement archive/delete
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Archive Project
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
        Assign Team
      </Button>
      <Button variant="destructive" size="sm">
        Archive Selected
      </Button>
    </>
  );

  if (orderedProjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No projects found matching your criteria
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
      emptyMessage="No projects found matching your criteria"
      tableCaption="Projects list with status, team, and progress information"
      getRowId={(row) => row.id}
    />
  );
}
