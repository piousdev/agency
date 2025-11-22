'use client';

import { useState } from 'react';
import {
  isAfter,
  isBefore,
  isToday,
  startOfToday,
  endOfWeek,
  startOfWeek,
  endOfMonth,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  Clock,
  Filter,
  LayoutList,
  Table2,
  X,
} from 'lucide-react';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import type { TeamMember } from '@/lib/api/users/types';
import { DeliverableTimelineView } from './views/timeline-view';
import { DeliverableListView } from './views/list-view';
import { DeliverableCalendarView } from './views/calendar-view';
import { BusinessCenterHeader } from '../components/header';

type ViewMode = 'timeline' | 'list' | 'calendar';
type TimeFilter = 'all' | 'overdue' | 'today' | 'this_week' | 'this_month' | 'upcoming';
type StatusFilter = 'all' | 'scheduled' | 'unscheduled';

interface DeliverablesClientProps {
  projectsWithDelivery: ProjectWithRelations[];
  projectsWithoutDelivery: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

const statuses = ['intake', 'proposal', 'in_development', 'in_review'] as const;
const statusLabels: Record<string, string> = {
  intake: 'Intake',
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
};

export function DeliverablesClient({
  projectsWithDelivery,
  projectsWithoutDelivery,
  teamMembers,
}: DeliverablesClientProps) {
  const [view, setView] = useState<ViewMode>('timeline');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [projectType, setProjectType] = useState<'all' | 'content' | 'software'>('all');

  // Combine projects based on status filter
  const allProjects =
    statusFilter === 'scheduled'
      ? projectsWithDelivery
      : statusFilter === 'unscheduled'
        ? projectsWithoutDelivery
        : [...projectsWithDelivery, ...projectsWithoutDelivery];

  // Calculate stats
  const today = startOfToday();
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(today);

  const overdueProjects = projectsWithDelivery.filter(
    (p) => p.deliveredAt && isBefore(new Date(p.deliveredAt), today) && p.status !== 'delivered'
  );
  const dueTodayProjects = projectsWithDelivery.filter(
    (p) => p.deliveredAt && isToday(new Date(p.deliveredAt)) && p.status !== 'delivered'
  );
  const dueThisWeekProjects = projectsWithDelivery.filter(
    (p) =>
      p.deliveredAt &&
      !isBefore(new Date(p.deliveredAt), today) &&
      !isAfter(new Date(p.deliveredAt), weekEnd) &&
      p.status !== 'delivered'
  );
  const dueThisMonthProjects = projectsWithDelivery.filter(
    (p) =>
      p.deliveredAt &&
      !isBefore(new Date(p.deliveredAt), today) &&
      !isAfter(new Date(p.deliveredAt), monthEnd) &&
      p.status !== 'delivered'
  );

  const stats = {
    total: projectsWithDelivery.length,
    overdue: overdueProjects.length,
    dueToday: dueTodayProjects.length,
    dueThisWeek: dueThisWeekProjects.length,
    dueThisMonth: dueThisMonthProjects.length,
    unscheduled: projectsWithoutDelivery.length,
  };

  // Filter projects
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const filteredProjects = allProjects.filter((project) => {
    // Filter by project type
    if (projectType === 'content' && project.client?.type !== 'creative') return false;
    if (projectType === 'software' && project.client?.type !== 'software') return false;

    // Filter by status
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) return false;

    // Filter by assignee
    if (selectedAssignees.length > 0) {
      const hasAssignee = project.assignees?.some((a) => selectedAssignees.includes(a.id));
      if (!hasAssignee) return false;
    }

    // Filter by time period
    if (timeFilter !== 'all' && project.deliveredAt) {
      const deliveryDate = new Date(project.deliveredAt);

      switch (timeFilter) {
        case 'overdue':
          if (!isBefore(deliveryDate, today) || project.status === 'delivered') return false;
          break;
        case 'today':
          if (!isToday(deliveryDate)) return false;
          break;
        case 'this_week':
          if (isBefore(deliveryDate, weekStart) || isAfter(deliveryDate, weekEnd)) return false;
          break;
        case 'this_month':
          if (isBefore(deliveryDate, today) || isAfter(deliveryDate, monthEnd)) return false;
          break;
        case 'upcoming':
          if (isBefore(deliveryDate, today)) return false;
          break;
      }
    } else if (timeFilter !== 'all' && !project.deliveredAt) {
      // Only show unscheduled projects if viewing "all"
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedAssignees.length > 0 ||
    timeFilter !== 'all' ||
    statusFilter !== 'all' ||
    projectType !== 'all';

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedAssignees([]);
    setTimeFilter('all');
    setStatusFilter('all');
    setProjectType('all');
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BusinessCenterHeader />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`cursor-pointer transition-colors ${timeFilter === 'overdue' ? 'border-destructive' : ''}`}
          onClick={() => setTimeFilter(timeFilter === 'overdue' ? 'all' : 'overdue')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${timeFilter === 'today' ? 'border-primary' : ''}`}
          onClick={() => setTimeFilter(timeFilter === 'today' ? 'all' : 'today')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueToday}</div>
            <p className="text-xs text-muted-foreground">Deliveries today</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${timeFilter === 'this_week' ? 'border-primary' : ''}`}
          onClick={() => setTimeFilter(timeFilter === 'this_week' ? 'all' : 'this_week')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueThisWeek}</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${timeFilter === 'this_month' ? 'border-primary' : ''}`}
          onClick={() => setTimeFilter(timeFilter === 'this_month' ? 'all' : 'this_month')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueThisMonth}</div>
            <p className="text-xs text-muted-foreground">Due this month</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${statusFilter === 'unscheduled' ? 'border-primary' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'unscheduled' ? 'all' : 'unscheduled')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unscheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unscheduled}</div>
            <p className="text-xs text-muted-foreground">No delivery date</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Views */}
      <Tabs value={view} onValueChange={(v: string) => setView(v as ViewMode)}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="timeline" className="gap-2">
              <LayoutList className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <Table2 className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Project Type Filter */}
            <Tabs
              value={projectType}
              onValueChange={(v: string) => setProjectType(v as typeof projectType)}
            >
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs">
                  Content
                </TabsTrigger>
                <TabsTrigger value="software" className="text-xs">
                  Software
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {selectedStatuses.length +
                        selectedAssignees.length +
                        (timeFilter !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                        <X className="mr-1 h-3 w-3" />
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {statuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {statusLabels[status]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignee Filter */}
                  {teamMembers.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Assignee</Label>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`assignee-${member.id}`}
                              checked={selectedAssignees.includes(member.id)}
                              onCheckedChange={() => toggleAssignee(member.id)}
                            />
                            <Label
                              htmlFor={`assignee-${member.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {member.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {timeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {timeFilter.replace('_', ' ')}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setTimeFilter('all')} />
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {statusFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </Badge>
            )}
            {projectType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {projectType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setProjectType('all')} />
              </Badge>
            )}
            {selectedStatuses.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                {statusLabels[status]}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatus(status)} />
              </Badge>
            ))}
            {selectedAssignees.map((id) => {
              const member = teamMembers.find((m) => m.id === id);
              return (
                <Badge key={id} variant="secondary" className="gap-1">
                  {member?.name || id}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleAssignee(id)} />
                </Badge>
              );
            })}
          </div>
        )}

        {/* View Content */}
        <TabsContent value="timeline" className="mt-6">
          <DeliverableTimelineView projects={filteredProjects} />
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <DeliverableListView projects={filteredProjects} />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <DeliverableCalendarView projects={filteredProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
