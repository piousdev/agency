'use client';

import * as React from 'react';
import { useState } from 'react';

import { IconDots, IconUser, IconCalendar, IconChartBar } from '@tabler/icons-react';


import { DataTable } from '@/components/data-table';
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

import type { TeamMember } from '@/lib/api/users/types';
import type { ColumnDef, Row } from '@tanstack/react-table';

interface TeamTableViewProps {
  teamMembers: TeamMember[];
}

type MemberStatus = 'available' | 'at_capacity' | 'overloaded';

const statusVariants: Record<MemberStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  available: 'default',
  at_capacity: 'secondary',
  overloaded: 'destructive',
};

const statusLabels: Record<MemberStatus, string> = {
  available: 'Available',
  at_capacity: 'At Capacity',
  overloaded: 'Overloaded',
};

export function TeamTableView({ teamMembers }: TeamTableViewProps) {
  const [orderedMembers, setOrderedMembers] = useState(teamMembers);

  const handleRowOrderChange = (newRowIdOrder: string[]) => {
    setOrderedMembers((prev) => {
      // Create a map for O(1) lookup of items by ID
      const itemMap = new Map(prev.map((item) => [item.id, item]));

      // Reorder items to match the new ID order
      const reordered = newRowIdOrder
        .map((id) => itemMap.get(id))
        .filter((item): item is TeamMember => item !== undefined);

      // Preserve any items not in the new order (shouldn't happen, but safe)
      const reorderedIds = new Set(newRowIdOrder);
      const remaining = prev.filter((item) => !reorderedIds.has(item.id));

      return [...reordered, ...remaining];
    });
  };

  const columns = React.useMemo<ColumnDef<TeamMember>[]>(
    () => {
      /* eslint-disable react/no-unstable-nested-components */
      return [
    {
      accessorKey: 'name',
      header: 'Team Member',
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate" title={row.original.name}>
          {row.original.name}
        </div>
      ),
      meta: {
        displayName: 'Team Member',
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
        if (!value.length) return true;
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
      accessorKey: 'capacityPercentage',
      header: 'Capacity',
      cell: ({ row }) => {
        const percentage = row.original.capacityPercentage;
        return (
          <div className="flex items-center gap-2 min-w-[140px]">
            <Progress
              value={percentage}
              className={`h-2 w-24 ${percentage > 100 ? '[&>div]:bg-destructive' : percentage > 80 ? '[&>div]:bg-yellow-500' : ''}`}
            />
            <span className="text-sm text-muted-foreground w-12">{percentage}%</span>
          </div>
        );
      },
      sortingFn: 'basic',
      meta: {
        displayName: 'Capacity Used',
        filterType: 'number-range',
      },
    },
    {
      accessorKey: 'availableCapacity',
      header: 'Available',
      cell: ({ row }) => (
        <span
          className={`text-sm ${row.original.availableCapacity < 20 ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {row.original.availableCapacity}%
        </span>
      ),
      sortingFn: 'basic',
      meta: {
        displayName: 'Available Capacity',
        filterType: 'number-range',
      },
    },
    {
      accessorKey: 'projectCount',
      header: 'Projects',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.projectCount}</span>,
      sortingFn: 'basic',
      meta: {
        displayName: 'Project Count',
        filterType: 'number-range',
      },
    },
    {
      accessorKey: 'projects',
      header: 'Active Projects',
      enableSorting: false,
      cell: ({ row }) => {
        const projects = row.original.projects;
        if (!projects.length) {
          return <span className="text-muted-foreground text-sm">No active projects</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {projects.slice(0, 2).map((project) => (
              <Badge
                key={project.id}
                variant="outline"
                className="text-xs truncate max-w-[90px]"
                title={project.name}
              >
                {project.name}
              </Badge>
            ))}
            {projects.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{projects.length - 2}
              </Badge>
            )}
          </div>
        );
      },
      meta: {
        displayName: 'Active Projects',
      },
    },
  ];
      /* eslint-enable react/no-unstable-nested-components */
    },
    []
  );

  const renderRowActions = (_row: Row<TeamMember>) => (
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
            // TODO: View member profile
          }}
        >
          <IconUser className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: View member schedule
          }}
        >
          <IconCalendar className="mr-2 h-4 w-4" />
          View Schedule
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // TODO: View workload details
          }}
        >
          <IconChartBar className="mr-2 h-4 w-4" />
          Workload Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderBulkActions = () => (
    <>
      <Button variant="outline" size="sm">
        Assign to Project
      </Button>
      <Button variant="outline" size="sm">
        Export Report
      </Button>
    </>
  );

  if (orderedMembers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No team members found
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={orderedMembers}
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
        enableVirtualization: orderedMembers.length > 100,
        estimatedRowHeight: 56,
        virtualTableHeight: 600,
        enableKeyboardNavigation: true,
      }}
      initialSorting={[{ id: 'capacityPercentage', desc: true }]}
      onRowOrderChange={handleRowOrderChange}
      renderRowActions={renderRowActions}
      renderBulkActions={renderBulkActions}
      emptyMessage="No team members found matching your criteria"
      tableCaption="Team capacity overview with workload distribution"
      getRowId={(row) => row.id}
    />
  );
}
