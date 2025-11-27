'use client';

import { useState } from 'react';

import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowsUpDown,
  IconArrowUp,
  IconMinus,
} from '@tabler/icons-react';
import { differenceInDays, format, isPast, isToday } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface DeliverableListViewProps {
  projects: ProjectWithRelations[];
}

type SortField = 'name' | 'client' | 'delivery' | 'status' | 'progress' | 'type';
type SortDirection = 'asc' | 'desc';

const statusOrder = ['intake', 'proposal', 'in_development', 'in_review', 'delivered', 'on_hold'];

const SortButton = ({
  field,
  children,
  sortField,
  sortDirection,
  onSort,
}: {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) => {
  const isActive = sortField === field;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => onSort(field)}
    >
      {children}
      {isActive ? (
        sortDirection === 'asc' ? (
          <IconArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <IconArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <IconArrowsUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
};

export function DeliverableListView({ projects }: DeliverableListViewProps) {
  const [sortField, setSortField] = useState<SortField>('delivery');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'client':
        comparison = a.client.name.localeCompare(b.client.name);
        break;
      case 'delivery': {
        const aDate = a.deliveredAt ? new Date(a.deliveredAt).getTime() : Infinity;
        const bDate = b.deliveredAt ? new Date(b.deliveredAt).getTime() : Infinity;
        comparison = aDate - bDate;
        break;
      }
      case 'status':
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      case 'progress':
        comparison = a.completionPercentage - b.completionPercentage;
        break;
      case 'type':
        comparison = a.client.type.localeCompare(b.client.type);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <SortButton
                field="name"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Project
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="type"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Type
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="client"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Client
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="delivery"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Delivery Date
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="status"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Status
              </SortButton>
            </TableHead>
            <TableHead className="w-[150px]">
              <SortButton
                field="progress"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Progress
              </SortButton>
            </TableHead>
            <TableHead>Team</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.map((project) => {
            const isOverdue =
              project.deliveredAt &&
              isPast(new Date(project.deliveredAt)) &&
              !isToday(new Date(project.deliveredAt)) &&
              project.status !== 'delivered';

            const daysOverdue =
              isOverdue && project.deliveredAt
                ? differenceInDays(new Date(), new Date(project.deliveredAt))
                : 0;

            const daysUntil =
              project.deliveredAt && !isPast(new Date(project.deliveredAt))
                ? differenceInDays(new Date(project.deliveredAt), new Date())
                : null;

            return (
              <TableRow key={project.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <IconAlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="truncate max-w-[250px]">{project.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      project.client.type === 'creative'
                        ? 'border-pink-500 text-pink-500'
                        : 'border-blue-500 text-blue-500'
                    }
                  >
                    {project.client.type === 'creative' ? 'Content' : 'Software'}
                  </Badge>
                </TableCell>
                <TableCell>{project.client.name}</TableCell>
                <TableCell>
                  {project.deliveredAt ? (
                    <div className={isOverdue ? 'text-destructive' : ''}>
                      <div>{format(new Date(project.deliveredAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">
                        {isOverdue ? (
                          <span className="text-destructive">{daysOverdue}d overdue</span>
                        ) : isToday(new Date(project.deliveredAt)) ? (
                          <span className="text-orange-500">Due today</span>
                        ) : daysUntil !== null ? (
                          `In ${String(daysUntil)} day${daysUntil === 1 ? '' : 's'}`
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <IconMinus className="h-3 w-3" />
                      Unscheduled
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {project.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{project.completionPercentage}%</span>
                    </div>
                    <Progress value={project.completionPercentage} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell>
                  {project.assignees.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {project.assignees.slice(0, 3).map((assignee) => (
                          <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={assignee.image ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {assignee.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {project.assignees.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{project.assignees.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
