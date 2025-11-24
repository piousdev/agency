'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SprintForm } from './forms/sprint-form';
import { toast } from 'sonner';
import {
  getSprintStatusColor,
  calculateSprintProgress,
  calculateDaysRemaining,
  type SprintStatus,
} from '@/lib/schemas/sprint';
import type { Sprint } from '@/lib/api/sprints/types';
import {
  createSprintAction,
  updateSprintAction,
  deleteSprintAction,
  startSprintAction,
  completeSprintAction,
} from '@/lib/actions/business-center/sprints';
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconRun,
  IconCalendar,
  IconPlayerPlay,
  IconCircleCheck,
  IconTarget,
  IconBan,
  IconClock,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface SprintListProps {
  sprints: Sprint[];
  projectId: string;
  canEdit?: boolean;
}

const statusIcons: Record<SprintStatus, React.ReactNode> = {
  planning: <IconClock className="h-4 w-4" />,
  active: <IconPlayerPlay className="h-4 w-4" />,
  completed: <IconCircleCheck className="h-4 w-4" />,
  cancelled: <IconBan className="h-4 w-4" />,
};

export function SprintList({
  sprints: initialSprints,
  projectId,
  canEdit = true,
}: SprintListProps) {
  const [sprints, setSprints] = useState(initialSprints);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCreateSubmit = async (formData: FormData) => {
    const result = await createSprintAction(formData);
    if (result.success && result.sprintId) {
      const newSprint: Sprint = {
        id: result.sprintId,
        projectId,
        name: formData.get('name') as string,
        goal: (formData.get('goal') as string) || null,
        status: (formData.get('status') as SprintStatus) || 'planning',
        startDate: (formData.get('startDate') as string) || null,
        endDate: (formData.get('endDate') as string) || null,
        plannedPoints: parseInt(formData.get('plannedPoints') as string) || 0,
        completedPoints: 0,
        sprintNumber: parseInt(formData.get('sprintNumber') as string) || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSprints((prev) => [...prev, newSprint]);
      toast.success('Sprint created successfully');
    }
    return result;
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingSprint) return { success: false, error: 'No sprint selected' };

    const result = await updateSprintAction(editingSprint.id, projectId, formData);
    if (result.success) {
      setSprints((prev) =>
        prev.map((s) =>
          s.id === editingSprint.id
            ? {
                ...s,
                name: (formData.get('name') as string) || s.name,
                goal: (formData.get('goal') as string) || s.goal,
                status: (formData.get('status') as SprintStatus) || s.status,
                startDate: (formData.get('startDate') as string) || s.startDate,
                endDate: (formData.get('endDate') as string) || s.endDate,
                plannedPoints: parseInt(formData.get('plannedPoints') as string) || s.plannedPoints,
                sprintNumber: parseInt(formData.get('sprintNumber') as string) || s.sprintNumber,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
      toast.success('Sprint updated successfully');
    }
    return result;
  };

  const handleDelete = async () => {
    if (!deletingSprint) return;

    setIsDeleting(true);
    try {
      const result = await deleteSprintAction(deletingSprint.id, projectId);
      if (result.success) {
        setSprints((prev) => prev.filter((s) => s.id !== deletingSprint.id));
        toast.success('Sprint deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete sprint');
      }
    } catch {
      toast.error('Failed to delete sprint');
    } finally {
      setIsDeleting(false);
      setDeletingSprint(null);
    }
  };

  const handleStartSprint = async (sprint: Sprint) => {
    setActionLoading(sprint.id);
    try {
      const result = await startSprintAction(sprint.id, projectId);
      if (result.success) {
        setSprints((prev) =>
          prev.map((s) =>
            s.id === sprint.id ? { ...s, status: 'active', startDate: new Date().toISOString() } : s
          )
        );
        toast.success('Sprint started');
      } else {
        toast.error(result.error || 'Failed to start sprint');
      }
    } catch {
      toast.error('Failed to start sprint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSprint = async (sprint: Sprint) => {
    setActionLoading(sprint.id);
    try {
      const result = await completeSprintAction(sprint.id, projectId);
      if (result.success) {
        setSprints((prev) =>
          prev.map((s) =>
            s.id === sprint.id
              ? { ...s, status: 'completed', endDate: new Date().toISOString() }
              : s
          )
        );
        toast.success('Sprint completed');
      } else {
        toast.error(result.error || 'Failed to complete sprint');
      }
    } catch {
      toast.error('Failed to complete sprint');
    } finally {
      setActionLoading(null);
    }
  };

  const activeSprints = sprints.filter((s) => s.status === 'active');
  const planningSprints = sprints.filter((s) => s.status === 'planning');
  const completedSprints = sprints.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled'
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconRun className="h-5 w-5" />
            Sprints
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeSprints.length} active, {planningSprints.length} planning
          </p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <IconPlus className="h-4 w-4 mr-1" />
            New Sprint
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {sprints.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No sprints yet. Create one to start organizing your work.
          </p>
        ) : (
          <>
            {/* Active Sprints */}
            {activeSprints.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Active</h4>
                {activeSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    canEdit={canEdit}
                    isLoading={actionLoading === sprint.id}
                    onEdit={() => setEditingSprint(sprint)}
                    onDelete={() => setDeletingSprint(sprint)}
                    onComplete={() => handleCompleteSprint(sprint)}
                  />
                ))}
              </div>
            )}

            {/* Planning Sprints */}
            {planningSprints.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Planning</h4>
                {planningSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    canEdit={canEdit}
                    isLoading={actionLoading === sprint.id}
                    onEdit={() => setEditingSprint(sprint)}
                    onDelete={() => setDeletingSprint(sprint)}
                    onStart={() => handleStartSprint(sprint)}
                  />
                ))}
              </div>
            )}

            {/* Completed Sprints */}
            {completedSprints.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
                {completedSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    canEdit={canEdit}
                    isLoading={actionLoading === sprint.id}
                    onEdit={() => setEditingSprint(sprint)}
                    onDelete={() => setDeletingSprint(sprint)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sprint</DialogTitle>
            <DialogDescription>Create a new sprint to organize your work.</DialogDescription>
          </DialogHeader>
          <SprintForm
            projectId={projectId}
            mode="create"
            onSubmit={handleCreateSubmit}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSprint} onOpenChange={(open) => !open && setEditingSprint(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
            <DialogDescription>Update sprint details.</DialogDescription>
          </DialogHeader>
          {editingSprint && (
            <SprintForm
              sprint={{
                id: editingSprint.id,
                projectId: editingSprint.projectId,
                name: editingSprint.name,
                goal: editingSprint.goal,
                status: editingSprint.status,
                startDate: editingSprint.startDate,
                endDate: editingSprint.endDate,
                plannedPoints: editingSprint.plannedPoints,
                sprintNumber: editingSprint.sprintNumber,
              }}
              projectId={projectId}
              mode="edit"
              onSubmit={handleEditSubmit}
              onSuccess={() => setEditingSprint(null)}
              onCancel={() => setEditingSprint(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingSprint}
        onOpenChange={(open) => !open && setDeletingSprint(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingSprint?.name}&quot;? This action cannot
              be undone. Tickets in this sprint will be moved to backlog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface SprintCardProps {
  sprint: Sprint;
  canEdit: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStart?: () => void;
  onComplete?: () => void;
}

function SprintCard({
  sprint,
  canEdit,
  isLoading,
  onEdit,
  onDelete,
  onStart,
  onComplete,
}: SprintCardProps) {
  const progress = calculateSprintProgress(sprint.plannedPoints, sprint.completedPoints);
  const daysRemaining = calculateDaysRemaining(sprint.endDate);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={cn('mt-0.5', getSprintStatusColor(sprint.status).split(' ')[1])}>
            {statusIcons[sprint.status]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{sprint.name}</h4>
              {sprint.sprintNumber && (
                <span className="text-xs text-muted-foreground">#{sprint.sprintNumber}</span>
              )}
              <Badge
                variant="outline"
                className={cn('text-xs', getSprintStatusColor(sprint.status))}
              >
                {sprint.status}
              </Badge>
            </div>
            {sprint.goal && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex items-start gap-1">
                <IconTarget className="h-3 w-3 mt-0.5 shrink-0" />
                {sprint.goal}
              </p>
            )}
          </div>
        </div>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sprint.status === 'planning' && onStart && (
                <DropdownMenuItem onClick={onStart}>
                  <IconPlayerPlay className="h-4 w-4 mr-2" />
                  Start Sprint
                </DropdownMenuItem>
              )}
              {sprint.status === 'active' && onComplete && (
                <DropdownMenuItem onClick={onComplete}>
                  <IconCircleCheck className="h-4 w-4 mr-2" />
                  Complete Sprint
                </DropdownMenuItem>
              )}
              {(onStart || onComplete) && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={onEdit}>
                <IconEdit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Progress Bar */}
      {sprint.plannedPoints > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {sprint.completedPoints} / {sprint.plannedPoints} points
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {sprint.startDate && (
          <span className="flex items-center gap-1">
            <IconCalendar className="h-3 w-3" />
            Started {format(new Date(sprint.startDate), 'MMM d')}
          </span>
        )}
        {sprint.endDate && sprint.status === 'active' && (
          <span
            className={cn(
              'flex items-center gap-1',
              daysRemaining !== null && daysRemaining < 0 && 'text-destructive',
              daysRemaining !== null &&
                daysRemaining <= 3 &&
                daysRemaining >= 0 &&
                'text-orange-600'
            )}
          >
            <IconClock className="h-3 w-3" />
            {daysRemaining !== null && daysRemaining < 0
              ? `${Math.abs(daysRemaining)} days overdue`
              : daysRemaining === 0
                ? 'Ends today'
                : `${daysRemaining} days remaining`}
          </span>
        )}
        {sprint.status === 'completed' && sprint.endDate && (
          <span className="flex items-center gap-1 text-green-600">
            <IconCircleCheck className="h-3 w-3" />
            Completed {formatDistanceToNow(new Date(sprint.endDate), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}
