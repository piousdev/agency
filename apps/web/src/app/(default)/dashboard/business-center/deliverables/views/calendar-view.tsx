'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  addMonths,
  subMonths,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface DeliverableCalendarViewProps {
  projects: ProjectWithRelations[];
}

export function DeliverableCalendarView({ projects }: DeliverableCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group projects by delivery date
  const projectsByDate = new Map<string, ProjectWithRelations[]>();
  projects.forEach((project) => {
    if (project.deliveredAt) {
      const dateKey = format(new Date(project.deliveredAt), 'yyyy-MM-dd');
      if (!projectsByDate.has(dateKey)) {
        projectsByDate.set(dateKey, []);
      }
      projectsByDate.get(dateKey)!.push(project);
    }
  });

  // Get projects for selected date
  const selectedDateProjects = selectedDate
    ? projectsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  // Navigation
  const goToPreviousMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const goToNextMonth = () => setCurrentDate((d) => addMonths(d, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div className="rounded-lg border bg-card">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayProjects = projectsByDate.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasOverdue = dayProjects.some(
                (p) => isPast(new Date(p.deliveredAt!)) && !isToday(day) && p.status !== 'delivered'
              );

              // Group by type for color display
              const contentProjects = dayProjects.filter(
                (p) => p.client?.type === 'creative'
              ).length;
              const softwareProjects = dayProjects.filter(
                (p) => p.client?.type === 'software'
              ).length;

              return (
                <TooltipProvider key={dateKey}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'relative h-24 p-1 text-left border-b border-r transition-colors hover:bg-accent/50',
                          !isCurrentMonth && 'text-muted-foreground/50 bg-muted/20',
                          isSelected && 'bg-accent',
                          isToday(day) && 'bg-primary/5',
                          index % 7 === 0 && 'border-l'
                        )}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div
                          className={cn(
                            'absolute top-1 left-1 h-6 w-6 flex items-center justify-center rounded-full text-sm',
                            isToday(day) && 'bg-primary text-primary-foreground font-semibold'
                          )}
                        >
                          {format(day, 'd')}
                        </div>

                        {/* Project indicators */}
                        {dayProjects.length > 0 && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="flex flex-wrap gap-1">
                              {hasOverdue && (
                                <div className="flex items-center gap-0.5 text-xs text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                </div>
                              )}
                              {contentProjects > 0 && (
                                <div className="h-2 w-2 rounded-full bg-pink-500" title="Content" />
                              )}
                              {softwareProjects > 0 && (
                                <div
                                  className="h-2 w-2 rounded-full bg-blue-500"
                                  title="Software"
                                />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {dayProjects.length}
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    {dayProjects.length > 0 && (
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(day, 'MMM d, yyyy')} - {dayProjects.length} delivery
                            {dayProjects.length > 1 ? 'ies' : 'y'}
                          </p>
                          <ul className="text-sm">
                            {dayProjects.slice(0, 5).map((p) => (
                              <li key={p.id} className="truncate">
                                • {p.name}
                              </li>
                            ))}
                            {dayProjects.length > 5 && (
                              <li className="text-muted-foreground">
                                ...and {dayProjects.length - 5} more
                              </li>
                            )}
                          </ul>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                </h3>
              </div>

              {selectedDate ? (
                selectedDateProjects.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {selectedDateProjects.map((project) => {
                      const isOverdue =
                        isPast(new Date(project.deliveredAt!)) &&
                        !isToday(new Date(project.deliveredAt!)) &&
                        project.status !== 'delivered';

                      return (
                        <div
                          key={project.id}
                          className={cn(
                            'p-3 rounded-lg border',
                            isOverdue && 'border-destructive/50 bg-destructive/5'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {isOverdue && (
                                  <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                                )}
                                <h4 className="font-medium text-sm truncate">{project.name}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {project.client?.name}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                'shrink-0 text-xs',
                                project.client?.type === 'creative'
                                  ? 'border-pink-500 text-pink-500'
                                  : 'border-blue-500 text-blue-500'
                              )}
                            >
                              {project.client?.type === 'creative' ? 'Content' : 'Software'}
                            </Badge>
                          </div>

                          <div className="mt-2 space-y-2">
                            <Badge variant="secondary" className="capitalize text-xs">
                              {project.status.replace('_', ' ')}
                            </Badge>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span>{project.completionPercentage || 0}%</span>
                              </div>
                              <Progress
                                value={project.completionPercentage || 0}
                                className="h-1.5"
                              />
                            </div>
                          </div>

                          {project.assignees && project.assignees.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Team: {project.assignees.map((a) => a.name).join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No deliveries on this date</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a date to see delivery details
                </p>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-3">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-pink-500" />
                  <span>Content Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Software Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <span>Overdue Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
