'use client';

import { useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconBuilding,
  IconUsers,
  IconPercentage,
  IconPencil,
  IconPlus,
  IconX,
  IconLoader2,
  IconCalendarPlus,
} from '@tabler/icons-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isBefore,
} from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { updateDeliveryDateAction } from '@/lib/actions/projects';
import { cn } from '@/lib/utils';


import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface ProjectCalendarViewProps {
  projects: ProjectWithRelations[];
  allProjects: ProjectWithRelations[];
}

const statusColors = {
  proposal: 'bg-blue-500',
  in_development: 'bg-yellow-500',
  in_review: 'bg-purple-500',
  delivered: 'bg-green-500',
  on_hold: 'bg-red-500',
  maintenance: 'bg-cyan-500',
  archived: 'bg-gray-500',
} as const;

const statusLabels = {
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
  on_hold: 'On Hold',
  maintenance: 'Maintenance',
  archived: 'Archived',
} as const;

const typeColors = {
  creative: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  software: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  full_service: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  one_time: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
} as const;

export function ProjectCalendarView({ projects, allProjects }: ProjectCalendarViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Edit mode state
  const [editingProject, setEditingProject] = useState<ProjectWithRelations | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Schedule mode state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  // Get projects with delivery dates
  const projectsWithDelivery = useMemo(() => {
    return projects.filter((p) => p.deliveredAt);
  }, [projects]);

  // Get projects without delivery dates (for scheduling) - from all projects
  const projectsWithoutDelivery = useMemo(() => {
    return allProjects.filter((p) => !p.deliveredAt && p.status !== 'delivered');
  }, [allProjects]);

  // Group projects by delivery date
  const projectsByDate = useMemo(() => {
    const map = new Map<string, ProjectWithRelations[]>();
    projectsWithDelivery.forEach((project) => {
      if (project.deliveredAt) {
        const dateKey = format(new Date(project.deliveredAt), 'yyyy-MM-dd');
        const existing = map.get(dateKey) ?? [];
        map.set(dateKey, [...existing, project]);
      }
    });
    return map;
  }, [projectsWithDelivery]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Get upcoming deliveries for sidebar
  const upcomingDeliveries = useMemo(() => {
    const now = new Date();
    return projectsWithDelivery
      .filter((p) => p.deliveredAt && new Date(p.deliveredAt) >= now)
      .sort((a, b) => {
        const dateA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
        const dateB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [projectsWithDelivery]);

  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setDialogOpen(true);
  };

  // Get projects for selected date
  const selectedDateProjects = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return projectsByDate.get(dateKey) ?? [];
  }, [selectedDate, projectsByDate]);

  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  // Handle edit delivery date
  const handleEditClick = (project: ProjectWithRelations) => {
    setEditingProject(project);
    setEditDate(project.deliveredAt ? format(new Date(project.deliveredAt), 'yyyy-MM-dd') : '');
    setEditDialogOpen(true);
  };

  // Handle save delivery date
  const handleSaveDelivery = () => {
    if (!editingProject) return;

    startTransition(async () => {
      const deliveredAt = editDate ? new Date(editDate).toISOString() : null;
      const result = await updateDeliveryDateAction(editingProject.id, deliveredAt);

      if (result.success) {
        setEditDialogOpen(false);
        setEditingProject(null);
        setDialogOpen(false);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  // Handle remove delivery date
  const handleRemoveDelivery = () => {
    if (!editingProject) return;

    startTransition(async () => {
      const result = await updateDeliveryDateAction(editingProject.id, null);

      if (result.success) {
        setEditDialogOpen(false);
        setEditingProject(null);
        setDialogOpen(false);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  // Handle schedule new delivery
  const handleScheduleClick = () => {
    if (selectedDate) {
      setScheduleDate(format(selectedDate, 'yyyy-MM-dd'));
    }
    setScheduleDialogOpen(true);
  };

  const handleScheduleDelivery = () => {
    if (!selectedProjectId || !scheduleDate) return;

    startTransition(async () => {
      const deliveredAt = new Date(scheduleDate).toISOString();
      const result = await updateDeliveryDateAction(selectedProjectId, deliveredAt);

      if (result.success) {
        setScheduleDialogOpen(false);
        setSelectedProjectId('');
        setScheduleDate('');
        setDialogOpen(false);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  // Helper to get project type label
  const getTypeLabel = (type: string | undefined) => {
    if (type === 'creative') return 'Content';
    return type ?? 'N/A';
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayProjects = projectsByDate.get(dateKey) ?? [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasProjects = dayProjects.length > 0;

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'min-h-[100px] p-2 border rounded-md text-left transition-colors',
                      'hover:bg-accent hover:border-accent-foreground/20',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      !isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                      isToday(day) && 'border-primary border-2',
                      hasProjects && 'bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'text-sm font-medium mb-1',
                        isToday(day) && 'text-primary font-bold'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayProjects.slice(0, 2).map((project) => (
                        <div
                          key={project.id}
                          className={cn(
                            'text-xs rounded px-1.5 py-0.5 truncate font-medium',
                            project.client.type === 'creative'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                          )}
                          title={`${project.name} (${getTypeLabel(project.client.type)})`}
                        >
                          {project.name}
                        </div>
                      ))}
                      {dayProjects.length > 2 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          +{dayProjects.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming deliveries sidebar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Deliveries</CardTitle>
            {projectsWithoutDelivery.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScheduleDate('');
                  setScheduleDialogOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deliveries</p>
            ) : (
              upcomingDeliveries.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    if (project.deliveredAt) {
                      setSelectedDate(new Date(project.deliveredAt));
                      setDialogOpen(true);
                    }
                  }}
                  className="w-full text-left space-y-1 p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-1">{project.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        typeColors[project.client.type as keyof typeof typeColors]
                      )}
                    >
                      {getTypeLabel(project.client.type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.client.name || 'N/A'}
                    </Badge>
                    {project.deliveredAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(project.deliveredAt), 'MMM d')}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDate && isPastDate(selectedDate) && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                This date is in the past
              </div>
            )}

            {selectedDateProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconCalendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No deliveries scheduled for this date</p>
                {projectsWithoutDelivery.length > 0 &&
                  selectedDate &&
                  !isPastDate(selectedDate) && (
                    <Button variant="outline" className="mt-4" onClick={handleScheduleClick}>
                      <IconCalendarPlus className="h-4 w-4 mr-2" />
                      Schedule a Delivery
                    </Button>
                  )}
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {selectedDateProjects.length}{' '}
                      {selectedDateProjects.length === 1 ? 'delivery' : 'deliveries'} scheduled
                    </p>
                    {projectsWithoutDelivery.length > 0 &&
                      selectedDate &&
                      !isPastDate(selectedDate) && (
                        <Button variant="outline" size="sm" onClick={handleScheduleClick}>
                          <IconPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                  </div>

                  {selectedDateProjects.map((project, index) => (
                    <div key={project.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="space-y-3">
                        {/* Project name and status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{project.name}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                typeColors[project.client.type as keyof typeof typeColors]
                              )}
                            >
                              {getTypeLabel(project.client.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="secondary"
                              className={cn('text-white text-xs', statusColors[project.status])}
                            >
                              {statusLabels[project.status]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditClick(project)}
                            >
                              <IconPencil className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Description */}
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Project details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconBuilding className="h-4 w-4" />
                            <span>{project.client.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconUsers className="h-4 w-4" />
                            <span>
                              {project.assignees.length} assignee
                              {project.assignees.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Completion progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <IconPercentage className="h-3 w-3" />
                              Completion
                            </span>
                            <span className="font-medium">{project.completionPercentage}%</span>
                          </div>
                          <Progress value={project.completionPercentage} className="h-2" />
                        </div>

                        {/* Assignees */}
                        {project.assignees.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.assignees.map((assignee) => (
                              <Badge key={assignee.id} variant="outline" className="text-xs">
                                {assignee.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Date Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery Date</DialogTitle>
            <DialogDescription>{editingProject?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Delivery Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleRemoveDelivery}
              disabled={isPending}
              className="sm:mr-auto"
            >
              {isPending ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconX className="h-4 w-4 mr-1" />
              )}
              Remove Date
            </Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDelivery} disabled={isPending || !editDate}>
              {isPending && <IconLoader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Delivery Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Schedule Delivery</DialogTitle>
            <DialogDescription>Select a project and set its delivery date</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-select">Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsWithoutDelivery.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({getTypeLabel(project.client.type)} - {project.client.name})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-date">Delivery Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleDelivery}
              disabled={isPending || !selectedProjectId || !scheduleDate}
            >
              {isPending && <IconLoader2 className="h-4 w-4 animate-spin mr-2" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
