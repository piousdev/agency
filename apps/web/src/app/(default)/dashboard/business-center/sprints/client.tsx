'use client';

import { useState, useMemo } from 'react';

import Link from 'next/link';

import {
  IconPlus,
  IconRun,
  IconCalendar,
  IconTarget,
  IconClock,
  IconChevronRight,
  IconPlayerPlay,
  IconCircleCheck,
  IconBan,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { SprintForm } from '@/components/business-center/forms/sprint-form';
import { SprintBurndownMini } from '@/components/business-center/sprint-burndown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSprintAction } from '@/lib/actions/business-center/sprints';
import {
  getSprintStatusColor,
  calculateSprintProgress,
  calculateDaysRemaining,
  type SprintStatus,
} from '@/lib/schemas/sprint';
import { cn } from '@/lib/utils';

import type { Sprint } from '@/lib/api/sprints/types';


interface SprintsClientProps {
  sprints: (Sprint & { project?: { id: string; name: string } })[];
  projects: { id: string; name: string }[];
  canEdit?: boolean;
}

const statusIcons: Record<SprintStatus, React.ReactNode> = {
  planning: <IconClock className="h-4 w-4" />,
  active: <IconPlayerPlay className="h-4 w-4" />,
  completed: <IconCircleCheck className="h-4 w-4" />,
  cancelled: <IconBan className="h-4 w-4" />,
};

export function SprintsClient({
  sprints: initialSprints,
  projects,
  canEdit = true,
}: SprintsClientProps) {
  const [sprints, setSprints] = useState(initialSprints);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Group sprints by status
  const groupedSprints = useMemo(() => {
    let filtered = sprints;

    if (selectedProject !== 'all') {
      filtered = filtered.filter((s) => s.projectId === selectedProject);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    return {
      active: filtered.filter((s) => s.status === 'active'),
      planning: filtered.filter((s) => s.status === 'planning'),
      completed: filtered.filter((s) => s.status === 'completed'),
      cancelled: filtered.filter((s) => s.status === 'cancelled'),
    };
  }, [sprints, selectedProject, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: sprints.length,
      active: sprints.filter((s) => s.status === 'active').length,
      planning: sprints.filter((s) => s.status === 'planning').length,
      completed: sprints.filter((s) => s.status === 'completed').length,
    };
  }, [sprints]);

  const handleCreateSubmit = async (formData: FormData) => {
    const result = await createSprintAction(formData);
    if (result.success && result.sprintId) {
      const projectId = formData.get('projectId') as string;
      const project = projects.find((p) => p.id === projectId);
      const newSprint: Sprint & { project?: { id: string; name: string } } = {
        id: result.sprintId,
        projectId,
        project: project ? { id: project.id, name: project.name } : undefined,
        name: formData.get('name') as string,
        goal: (formData.get('goal') as string) || null,
        status: ((formData.get('status') ?? 'planning') as SprintStatus),
        startDate: (formData.get('startDate') as string) || null,
        endDate: (formData.get('endDate') as string) || null,
        plannedPoints: parseInt(formData.get('plannedPoints') as string),
        completedPoints: 0,
        sprintNumber: parseInt(formData.get('sprintNumber') as string) || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSprints((prev) => [newSprint, ...prev]);
      toast.success('Sprint created successfully');
    }
    return result;
  };

  const allFilteredSprints = [
    ...groupedSprints.active,
    ...groupedSprints.planning,
    ...groupedSprints.completed,
    ...groupedSprints.cancelled,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IconRun className="h-6 w-6" />
            Sprints
          </h1>
          <p className="text-muted-foreground">Manage sprints across all projects</p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            New Sprint
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <IconPlayerPlay className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Sprints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <IconClock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.planning}</p>
                <p className="text-xs text-muted-foreground">In Planning</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <IconCircleCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <IconTarget className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Sprints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="space-y-2 flex-1">
              <label htmlFor="project-filter" className="text-sm font-medium">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-filter">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint List */}
      {allFilteredSprints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconRun className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No sprints found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedProject !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first sprint to get started'}
            </p>
            {canEdit && selectedProject === 'all' && statusFilter === 'all' && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <IconPlus className="h-4 w-4 mr-2" />
                Create Sprint
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allFilteredSprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sprint</DialogTitle>
            <DialogDescription>Create a new sprint for a project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="create-sprint-project" className="text-sm font-medium">Project *</label>
              <Select
                onValueChange={(value) => {
                  const form = document.querySelector('form');
                  if (form) {
                    const input = form.querySelector('input[name="projectId"]');
                    if (input && input instanceof HTMLInputElement) {
                      input.value = value;
                    }
                  }
                }}
              >
                <SelectTrigger id="create-sprint-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SprintForm
              projectId={projects[0]?.id}
              mode="create"
              onSubmit={handleCreateSubmit}
              onSuccess={() => setIsCreateOpen(false)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SprintCardProps {
  sprint: Sprint & { project?: { id: string; name: string } };
}

function SprintCard({ sprint }: SprintCardProps) {
  const _progress = calculateSprintProgress(sprint.plannedPoints, sprint.completedPoints);
  const _daysRemaining = calculateDaysRemaining(sprint.endDate);

  return (
    <Link href={`/dashboard/business-center/sprints/${sprint.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={getSprintStatusColor(sprint.status).split(' ')[1]}>
                  {statusIcons[sprint.status]}
                </span>
                {sprint.name}
              </CardTitle>
              {sprint.project && (
                <CardDescription className="text-xs">{sprint.project.name}</CardDescription>
              )}
            </div>
            <Badge variant="outline" className={cn('text-xs', getSprintStatusColor(sprint.status))}>
              {sprint.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Goal */}
          {sprint.goal && (
            <p className="text-sm text-muted-foreground line-clamp-2 flex items-start gap-1">
              <IconTarget className="h-3 w-3 mt-1 shrink-0" />
              {sprint.goal}
            </p>
          )}

          {/* Progress */}
          <SprintBurndownMini sprint={sprint} />

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {sprint.startDate && (
              <span className="flex items-center gap-1">
                <IconCalendar className="h-3 w-3" />
                {format(new Date(sprint.startDate), 'MMM d')}
                {sprint.endDate && ` - ${format(new Date(sprint.endDate), 'MMM d')}`}
              </span>
            )}
            <IconChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
