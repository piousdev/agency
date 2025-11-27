'use client';

import { useState } from 'react';

import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconFlag,
  IconCalendar,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconProgress,
  IconBan,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  createMilestoneAction,
  updateMilestoneAction,
  deleteMilestoneAction,
} from '@/lib/actions/business-center/milestones';
import { getMilestoneStatusColor, type MilestoneStatus } from '@/lib/schemas/milestone';
import { cn } from '@/lib/utils';

import { MilestoneForm } from './forms/milestone-form';
import { MilestoneProgress } from './milestone-progress';

import type { Milestone } from '@/lib/api/milestones/types';

interface MilestoneListProps {
  milestones: Milestone[];
  projectId: string;
  canEdit?: boolean;
}

const statusIcons: Record<MilestoneStatus, React.ReactNode> = {
  pending: <IconClock className="h-4 w-4" />,
  in_progress: <IconProgress className="h-4 w-4" />,
  completed: <IconCircleCheck className="h-4 w-4" />,
  missed: <IconCircleX className="h-4 w-4" />,
  cancelled: <IconBan className="h-4 w-4" />,
};

export function MilestoneList({
  milestones: initialMilestones,
  projectId,
  canEdit = true,
}: MilestoneListProps) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateSubmit = async (formData: FormData) => {
    const result = await createMilestoneAction(formData);
    if (result.success && result.milestoneId) {
      // Optimistically add the milestone to the list
      const newMilestone: Milestone = {
        id: result.milestoneId,
        projectId,
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || null,
        status: formData.get('status') as MilestoneStatus,
        dueDate: (formData.get('dueDate') as string) || null,
        sortOrder: parseInt(formData.get('sortOrder') as string),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMilestones((prev) => [...prev, newMilestone].sort((a, b) => a.sortOrder - b.sortOrder));
      toast.success('Milestone created successfully');
    }
    return result;
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingMilestone) return { success: false, error: 'No milestone selected' };

    const result = await updateMilestoneAction(editingMilestone.id, projectId, formData);
    if (result.success) {
      // Optimistically update the milestone in the list
      setMilestones((prev) =>
        prev
          .map((m) =>
            m.id === editingMilestone.id
              ? {
                  ...m,
                  name: (formData.get('name') as string) || m.name,
                  description: (formData.get('description') as string) || m.description,
                  status: (formData.get('status') ?? m.status) as MilestoneStatus,
                  dueDate: (formData.get('dueDate') as string) || m.dueDate,
                  sortOrder: parseInt(formData.get('sortOrder') as string) || m.sortOrder,
                  updatedAt: new Date().toISOString(),
                }
              : m
          )
          .sort((a, b) => a.sortOrder - b.sortOrder)
      );
      toast.success('Milestone updated successfully');
    }
    return result;
  };

  const handleDelete = async () => {
    if (!deletingMilestone) return;

    setIsDeleting(true);
    try {
      const result = await deleteMilestoneAction(deletingMilestone.id, projectId);
      if (result.success) {
        setMilestones((prev) => prev.filter((m) => m.id !== deletingMilestone.id));
        toast.success('Milestone deleted successfully');
      } else {
        toast.error(result.error ?? 'Failed to delete milestone');
      }
    } catch {
      toast.error('Failed to delete milestone');
    } finally {
      setIsDeleting(false);
      setDeletingMilestone(null);
    }
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconFlag className="h-5 w-5" />
            Milestones
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {milestones.length} completed
          </p>
        </div>
        {canEdit && (
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <IconPlus className="h-4 w-4 mr-1" />
            Add Milestone
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        {milestones.length > 0 && <MilestoneProgress milestones={milestones} />}

        {/* Milestones List */}
        {milestones.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No milestones yet. Add one to track project progress.
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'mt-0.5',
                      getMilestoneStatusColor(milestone.status).split(' ')[1]
                    )}
                  >
                    {statusIcons[milestone.status]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{milestone.name}</h4>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getMilestoneStatusColor(milestone.status))}
                      >
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {milestone.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {milestone.dueDate && (
                        <span className="flex items-center gap-1">
                          <IconCalendar className="h-3 w-3" />
                          Due{' '}
                          {formatDistanceToNow(new Date(milestone.dueDate), { addSuffix: true })}
                        </span>
                      )}
                      {milestone.completedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <IconCircleCheck className="h-3 w-3" />
                          Completed{' '}
                          {formatDistanceToNow(new Date(milestone.completedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingMilestone(milestone)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingMilestone(milestone)}
                        className="text-destructive focus:text-destructive"
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>Add a new milestone to track project progress.</DialogDescription>
          </DialogHeader>
          <MilestoneForm
            projectId={projectId}
            mode="create"
            onSubmit={handleCreateSubmit}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone details.</DialogDescription>
          </DialogHeader>
          {editingMilestone && (
            <MilestoneForm
              milestone={{
                id: editingMilestone.id,
                projectId: editingMilestone.projectId,
                name: editingMilestone.name,
                description: editingMilestone.description,
                status: editingMilestone.status,
                dueDate: editingMilestone.dueDate,
                sortOrder: editingMilestone.sortOrder,
              }}
              projectId={projectId}
              mode="edit"
              onSubmit={handleEditSubmit}
              onSuccess={() => setEditingMilestone(null)}
              onCancel={() => setEditingMilestone(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingMilestone}
        onOpenChange={(open) => !open && setDeletingMilestone(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingMilestone?.name}&quot;? This action
              cannot be undone.
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
