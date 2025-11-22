'use client';

import { useState } from 'react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, AlertTriangle, Calendar, Minus } from 'lucide-react';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface DeliverableListViewProps {
  projects: ProjectWithRelations[];
}

type SortField = 'name' | 'client' | 'delivery' | 'status' | 'progress' | 'type';
type SortDirection = 'asc' | 'desc';

const statusOrder = ['intake', 'proposal', 'in_development', 'in_review', 'delivered', 'on_hold'];

export function DeliverableListView({ projects }: DeliverableListViewProps) {
  const [sortField, setSortField] = useState<SortField>('delivery');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
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
        comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
        break;
      case 'delivery':
        // Sort null dates to the end
        if (!a.deliveredAt && !b.deliveredAt) comparison = 0;
        else if (!a.deliveredAt) comparison = 1;
        else if (!b.deliveredAt) comparison = -1;
        else comparison = new Date(a.deliveredAt).getTime() - new Date(b.deliveredAt).getTime();
        break;
      case 'status':
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      case 'progress':
        comparison = (a.completionPercentage || 0) - (b.completionPercentage || 0);
        break;
      case 'type':
        comparison = (a.client?.type || '').localeCompare(b.client?.type || '');
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => handleSort(field)}
      >
        {children}
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Calendar className="h-12 w-12 mb-4" />
        <p>No deliverables found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <SortButton field="name">Project</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="type">Type</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="client">Client</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="delivery">Delivery Date</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">Status</SortButton>
            </TableHead>
            <TableHead className="w-[150px]">
              <SortButton field="progress">Progress</SortButton>
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

            const daysOverdue = isOverdue
              ? differenceInDays(new Date(), new Date(project.deliveredAt!))
              : 0;

            const daysUntil =
              project.deliveredAt && !isPast(new Date(project.deliveredAt))
                ? differenceInDays(new Date(project.deliveredAt), new Date())
                : null;

            return (
              <TableRow key={project.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                    <span className="truncate max-w-[250px]">{project.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      project.client?.type === 'creative'
                        ? 'border-pink-500 text-pink-500'
                        : 'border-blue-500 text-blue-500'
                    }
                  >
                    {project.client?.type === 'creative' ? 'Content' : 'Software'}
                  </Badge>
                </TableCell>
                <TableCell>{project.client?.name || 'N/A'}</TableCell>
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
                          `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Minus className="h-3 w-3" />
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
                      <span className="text-muted-foreground">
                        {project.completionPercentage || 0}%
                      </span>
                    </div>
                    <Progress value={project.completionPercentage || 0} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell>
                  {project.assignees && project.assignees.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {project.assignees.slice(0, 3).map((assignee) => (
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
