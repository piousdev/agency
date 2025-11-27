'use client';

import { useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  DragDropContext,
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  Droppable,
  type DroppableProvided,
  type DroppableStateSnapshot,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  IconAlertTriangle,
  IconCalendar,
  IconGripVertical,
  IconLoader2,
  IconPlus,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { updateProjectStatusAction } from '@/lib/actions/business-center/projects';
import { cn } from '@/lib/utils';

import type { Project, ProjectWithRelations } from '@/lib/api/projects/types';

interface ProjectKanbanViewProps {
  projects: ProjectWithRelations[];
}

type ProjectStatus = Project['status'];

const statuses: readonly ProjectStatus[] = ['proposal', 'in_development', 'in_review', 'delivered'];

const statusLabels: Record<ProjectStatus, string> = {
  proposal: 'Proposal',
  in_development: 'In Development',
  in_review: 'In Review',
  delivered: 'Delivered',
  on_hold: 'On Hold',
  maintenance: 'Maintenance',
  archived: 'Archived',
};

const statusColors: Record<ProjectStatus, string> = {
  proposal: 'bg-blue-500/10 ring-blue-500/30',
  in_development: 'bg-amber-500/10 ring-amber-500/30',
  in_review: 'bg-purple-500/10 ring-purple-500/30',
  delivered: 'bg-emerald-500/10 ring-emerald-500/30',
  on_hold: 'bg-muted ring-muted-foreground/20',
  maintenance: 'bg-cyan-500/10 ring-cyan-500/30',
  archived: 'bg-muted ring-muted-foreground/20',
};

const statusHeaderColors: Record<ProjectStatus, string> = {
  proposal: 'text-blue-600 dark:text-blue-400',
  in_development: 'text-amber-600 dark:text-amber-400',
  in_review: 'text-purple-600 dark:text-purple-400',
  delivered: 'text-emerald-600 dark:text-emerald-400',
  on_hold: 'text-muted-foreground',
  maintenance: 'text-cyan-600 dark:text-cyan-400',
  archived: 'text-muted-foreground',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '[&>div]:bg-emerald-500';
  if (percentage >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-blue-500';
}

export function ProjectKanbanView({ projects: initialProjects }: ProjectKanbanViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Store projects grouped by status to maintain order within each column
  const [projectsByStatus, setProjectsByStatus] = useState<
    Record<ProjectStatus, ProjectWithRelations[]>
  >(() => {
    const grouped = {} as Record<ProjectStatus, ProjectWithRelations[]>;
    for (const status of statuses) {
      grouped[status] = initialProjects.filter((p) => p.status === status);
    }
    return grouped;
  });

  const handleDragStart = (result: { draggableId: string }) => {
    setDraggingId(result.draggableId);
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggingId(null);

    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as ProjectStatus;
    const oldStatus = source.droppableId as ProjectStatus;

    // Find the project being moved
    const sourceColumn = projectsByStatus[oldStatus];
    const project = sourceColumn[source.index];
    if (!project) return;

    // Create new state with proper reordering
    setProjectsByStatus((prev) => {
      const newState = { ...prev };

      if (oldStatus === newStatus) {
        // Same column reorder
        const column = [...prev[oldStatus]];
        const removed = column.splice(source.index, 1)[0];
        if (removed) {
          column.splice(destination.index, 0, removed);
        }
        newState[oldStatus] = column;
      } else {
        // Cross-column move
        const sourceCol = [...prev[oldStatus]];
        const destCol = [...prev[newStatus]];
        const removed = sourceCol.splice(source.index, 1)[0];
        if (removed) {
          // Update the project status
          const updatedProject = { ...removed, status: newStatus };
          destCol.splice(destination.index, 0, updatedProject);
        }
        newState[oldStatus] = sourceCol;
        newState[newStatus] = destCol;
      }

      return newState;
    });

    // Only call API if status actually changed
    if (newStatus !== oldStatus) {
      startTransition(async () => {
        const apiResult = await updateProjectStatusAction(draggableId, newStatus);

        if (!apiResult.success) {
          // Revert optimistic update on failure
          setProjectsByStatus((prev) => {
            const newState = { ...prev };
            const destCol = [...prev[newStatus]];
            const sourceCol = [...prev[oldStatus]];
            // Find and remove the project from destination
            const idx = destCol.findIndex((p) => p.id === draggableId);
            if (idx !== -1) {
              const removed = destCol.splice(idx, 1)[0];
              if (removed) {
                // Revert status and add back to source
                const revertedProject = {
                  ...removed,
                  status: oldStatus,
                } as ProjectWithRelations;
                sourceCol.splice(source.index, 0, revertedProject);
              }
            }
            newState[newStatus] = destCol;
            newState[oldStatus] = sourceCol;
            return newState;
          });
          toast.error(apiResult.error || 'Failed to update project status');
        } else {
          toast.success(`Moved "${project.name}" to ${statusLabels[newStatus]}`);
        }
      });
    }
  };

  const handleCardClick = (projectId: string) => {
    router.push(`/dashboard/business-center/projects/${projectId}`);
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {statuses.map((status) => (
          <div key={status} className="min-w-0">
            <div className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-sm font-semibold', statusHeaderColors[status])}>
                    {statusLabels[status]}
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {projectsByStatus[status].length}
                  </span>
                </div>
                <Link
                  href={`/dashboard/business-center/projects/new?status=${status}`}
                  className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={`Add ${statusLabels[status]} project`}
                >
                  <IconPlus className="h-4 w-4" />
                </Link>
              </div>

              <Droppable droppableId={status}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver && statusColors[status],
                      snapshot.isDraggingOver && 'ring-2'
                    )}
                  >
                    {projectsByStatus[status].length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border/50 text-sm text-muted-foreground">
                        No projects
                      </div>
                    )}
                    {projectsByStatus[status].map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(
                          dragProvided: DraggableProvided,
                          dragSnapshot: DraggableStateSnapshot
                        ) => {
                          const isOverdue =
                            project.deliveredAt &&
                            new Date(project.deliveredAt) < new Date() &&
                            project.status !== 'delivered';
                          const progress = project.completionPercentage;

                          return (
                            <button
                              type="button"
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={cn(
                                'bg-card border rounded-lg p-3 transition-all cursor-pointer hover:shadow-md hover:border-border w-full text-left',
                                dragSnapshot.isDragging &&
                                  'shadow-lg ring-2 ring-primary/30 cursor-grabbing',
                                isPending && draggingId === project.id && 'opacity-70'
                              )}
                              onClick={() =>
                                !dragSnapshot.isDragging && handleCardClick(project.id)
                              }
                            >
                              {/* Card Header: Progress + Drag Handle */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-semibold px-1.5 py-0 h-5 tabular-nums"
                                >
                                  {progress}%
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {isPending && draggingId === project.id && (
                                    <IconLoader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                  )}
                                  <button
                                    type="button"
                                    {...(dragProvided.dragHandleProps)}
                                    className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconGripVertical className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-2">
                                {project.name}
                              </h4>

                              {/* Progress Bar */}
                              <Progress
                                value={progress}
                                className={cn('h-1 mb-2', getProgressColor(progress))}
                              />

                              {/* Meta: Client + Date */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span className="truncate max-w-[55%]">
                                  {project.client.name || 'No client'}
                                </span>
                                <div
                                  className={cn(
                                    'flex items-center gap-1 shrink-0',
                                    isOverdue && 'text-destructive'
                                  )}
                                >
                                  {isOverdue ? (
                                    <IconAlertTriangle className="h-3 w-3" />
                                  ) : (
                                    <IconCalendar className="h-3 w-3" />
                                  )}
                                  <span className="tabular-nums">
                                    {project.deliveredAt
                                      ? format(new Date(project.deliveredAt), 'MMM d')
                                      : 'No date'}
                                  </span>
                                </div>
                              </div>

                              {/* Footer: Team Avatars */}
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                {project.assignees.length > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <div className="flex -space-x-1">
                                      {project.assignees.slice(0, 3).map((assignee) => (
                                        <Avatar
                                          key={assignee.id}
                                          className="h-5 w-5 border border-background"
                                        >
                                          {assignee.image && (
                                            <AvatarImage
                                              src={assignee.image}
                                              alt={assignee.name}
                                            />
                                          )}
                                          <AvatarFallback className="text-[7px] font-medium bg-muted">
                                            {getInitials(assignee.name || assignee.email || '?')}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {project.assignees.length > 3 && (
                                        <Avatar className="h-5 w-5 border border-background">
                                          <AvatarFallback className="text-[7px] font-medium bg-muted text-muted-foreground">
                                            +{project.assignees.length - 3}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground ml-1">
                                      {project.assignees.length}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-amber-600 dark:text-amber-500">
                                    Needs team
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
