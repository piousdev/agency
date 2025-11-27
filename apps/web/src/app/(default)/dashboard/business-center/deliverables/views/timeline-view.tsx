import { IconAlertTriangle, IconBuilding, IconCalendar, IconClock } from '@tabler/icons-react';
import {
  addDays,
  differenceInDays,
  format,
  isPast,
  isToday,
  isTomorrow,
  startOfDay,
} from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface DeliverableTimelineViewProps {
  projects: ProjectWithRelations[];
}

interface TimelineGroup {
  label: string;
  date: Date | null;
  projects: ProjectWithRelations[];
  variant: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'unscheduled';
}

export function DeliverableTimelineView({ projects }: DeliverableTimelineViewProps) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  // Separate scheduled and unscheduled
  const scheduled = projects.filter((p) => p.deliveredAt !== null);
  const unscheduled = projects.filter((p) => p.deliveredAt === null);

  // Group scheduled by date proximity
  const overdue: ProjectWithRelations[] = [];
  const dueToday: ProjectWithRelations[] = [];
  const dueTomorrow: ProjectWithRelations[] = [];
  const upcoming = new Map<string, ProjectWithRelations[]>();

  scheduled.forEach((project) => {
    if (!project.deliveredAt) return;
    const deliveryDate = startOfDay(new Date(project.deliveredAt));

    if (isPast(deliveryDate) && !isToday(deliveryDate) && project.status !== 'delivered') {
      overdue.push(project);
    } else if (isToday(deliveryDate)) {
      dueToday.push(project);
    } else if (isTomorrow(deliveryDate)) {
      dueTomorrow.push(project);
    } else {
      const dateKey = format(deliveryDate, 'yyyy-MM-dd');
      if (!upcoming.has(dateKey)) {
        upcoming.set(dateKey, []);
      }
      const dateProjects = upcoming.get(dateKey);
      if (dateProjects) {
        dateProjects.push(project);
      }
    }
  });

  // Build groups array
  const groups: TimelineGroup[] = [];

  if (overdue.length > 0) {
    // Sort overdue by date (most overdue first)
    overdue.sort((a, b) => {
      const aTime = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
      const bTime = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
      return aTime - bTime;
    });
    groups.push({
      label: 'Overdue',
      date: null,
      projects: overdue,
      variant: 'overdue',
    });
  }

  if (dueToday.length > 0) {
    groups.push({
      label: 'Today',
      date: today,
      projects: dueToday,
      variant: 'today',
    });
  }

  if (dueTomorrow.length > 0) {
    groups.push({
      label: 'Tomorrow',
      date: tomorrow,
      projects: dueTomorrow,
      variant: 'tomorrow',
    });
  }

  // Sort upcoming dates and add groups
  const sortedDates = Array.from(upcoming.keys()).sort();
  sortedDates.forEach((dateKey) => {
    const date = new Date(dateKey);
    const daysUntil = differenceInDays(date, today);
    let label: string;

    if (daysUntil <= 7) {
      label = format(date, 'EEEE'); // Day name
    } else {
      label = format(date, 'MMM d, yyyy');
    }

    const dateProjects = upcoming.get(dateKey);
    groups.push({
      label,
      date,
      projects: dateProjects,
      variant: 'upcoming',
    });
  });

  if (unscheduled.length > 0) {
    groups.push({
      label: 'Unscheduled',
      date: null,
      projects: unscheduled,
      variant: 'unscheduled',
    });
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <IconCalendar className="h-12 w-12 mb-4" />
        <p>No deliverables found matching your criteria</p>
      </div>
    );
  }

  const getVariantStyles = (variant: TimelineGroup['variant']) => {
    switch (variant) {
      case 'overdue':
        return {
          border: 'border-l-destructive',
          icon: <IconAlertTriangle className="h-5 w-5 text-destructive" />,
          bg: 'bg-destructive/5',
        };
      case 'today':
        return {
          border: 'border-l-orange-500',
          icon: <IconClock className="h-5 w-5 text-orange-500" />,
          bg: 'bg-orange-500/5',
        };
      case 'tomorrow':
        return {
          border: 'border-l-yellow-500',
          icon: <IconCalendar className="h-5 w-5 text-yellow-500" />,
          bg: 'bg-yellow-500/5',
        };
      case 'upcoming':
        return {
          border: 'border-l-blue-500',
          icon: <IconCalendar className="h-5 w-5 text-blue-500" />,
          bg: 'bg-blue-500/5',
        };
      case 'unscheduled':
        return {
          border: 'border-l-muted-foreground',
          icon: <IconCalendar className="h-5 w-5 text-muted-foreground" />,
          bg: 'bg-muted/50',
        };
    }
  };

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => {
        const styles = getVariantStyles(group.variant);

        return (
          <div key={`${group.label}-${String(groupIndex)}`} className="space-y-3">
            {/* Group Header */}
            <div className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg}`}>
              {styles.icon}
              <div className="flex-1">
                <h3 className="font-semibold">{group.label}</h3>
                {group.date && group.variant !== 'overdue' && (
                  <p className="text-sm text-muted-foreground">
                    {format(group.date, 'EEEE, MMMM d, yyyy')}
                  </p>
                )}
              </div>
              <Badge variant={group.variant === 'overdue' ? 'destructive' : 'secondary'}>
                {group.projects.length} {group.projects.length === 1 ? 'project' : 'projects'}
              </Badge>
            </div>

            {/* Projects in this group */}
            <div className="space-y-2 pl-4">
              {group.projects.map((project) => {
                const isOverdue =
                  project.deliveredAt &&
                  isPast(new Date(project.deliveredAt)) &&
                  !isToday(new Date(project.deliveredAt)) &&
                  project.status !== 'delivered';

                return (
                  <Card
                    key={project.id}
                    className={`border-l-4 ${styles.border} hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <h4 className="font-medium truncate">{project.name}</h4>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {project.client.type === 'creative' ? 'Content' : 'Software'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconBuilding className="h-3 w-3" />
                              {project.client.name || 'N/A'}
                            </span>
                            {project.deliveredAt && (
                              <span
                                className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}
                              >
                                <IconCalendar className="h-3 w-3" />
                                {format(new Date(project.deliveredAt), 'MMM d, yyyy')}
                                {isOverdue && (
                                  <span className="text-xs">
                                    ({differenceInDays(new Date(), new Date(project.deliveredAt))}d
                                    overdue)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status & Progress */}
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="capitalize">
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <div className="w-24">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span>{project.completionPercentage}%</span>
                            </div>
                            <Progress value={project.completionPercentage} className="h-1.5" />
                          </div>
                        </div>

                        {/* Team */}
                        {project.assignees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {project.assignees.slice(0, 3).map((assignee) => (
                                <Avatar
                                  key={assignee.id}
                                  className="h-7 w-7 border-2 border-background"
                                >
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
                              <span className="text-xs text-muted-foreground ml-1">
                                +{project.assignees.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
