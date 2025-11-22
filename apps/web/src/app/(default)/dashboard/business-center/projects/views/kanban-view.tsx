'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
  type DroppableStateSnapshot,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building2, CalendarClock, Users, GripVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateProjectStatusAction } from '@/lib/actions/business-center/projects';
import type { ProjectWithRelations, Project } from '@/lib/api/projects/types';
import { toast } from 'sonner';

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
  proposal: 'bg-muted ring-muted-foreground/20',
  in_development: 'bg-info/10 ring-info/30',
  in_review: 'bg-warning/10 ring-warning/30',
  delivered: 'bg-success/10 ring-success/30',
  on_hold: 'bg-muted ring-muted-foreground/20',
  maintenance: 'bg-info/10 ring-info/30',
  archived: 'bg-muted ring-muted-foreground/20',
};

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
                const revertedProject = { ...removed, status: oldStatus } as ProjectWithRelations;
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{statusLabels[status]}</h3>
                <Badge variant="secondary">{projectsByStatus[status].length}</Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'space-y-3 min-h-[200px] rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver && statusColors[status],
                      snapshot.isDraggingOver && 'ring-2'
                    )}
                  >
                    {projectsByStatus[status].length === 0 && !snapshot.isDraggingOver && (
                      <Card className="border-dashed">
                        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                          No projects
                        </CardContent>
                      </Card>
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

                          return (
                            <Card
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={cn(
                                'transition-shadow cursor-pointer hover:shadow-md',
                                dragSnapshot.isDragging &&
                                  'shadow-lg ring-2 ring-primary/30 cursor-grabbing',
                                isPending && draggingId === project.id && 'opacity-70'
                              )}
                              onClick={() =>
                                !dragSnapshot.isDragging && handleCardClick(project.id)
                              }
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2">
                                    <div
                                      {...(dragProvided.dragHandleProps ?? {})}
                                      className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-sm line-clamp-2">
                                      {project.name}
                                    </CardTitle>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {isPending && draggingId === project.id && (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    )}
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                      {project.client?.type === 'creative'
                                        ? 'Content'
                                        : project.client?.type || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Building2 className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{project.client?.name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CalendarClock className="h-3 w-3 shrink-0" />
                                  <span className={isOverdue ? 'text-destructive' : ''}>
                                    {project.deliveredAt
                                      ? format(new Date(project.deliveredAt), 'MMM d')
                                      : 'No date'}
                                    {isOverdue && ' (!)'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="h-3 w-3 shrink-0" />
                                  <span>
                                    {project.assignees && project.assignees.length > 0
                                      ? `${project.assignees.length} team`
                                      : 'No team'}
                                  </span>
                                </div>
                                <div className="pt-1">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span>{project.completionPercentage || 0}%</span>
                                  </div>
                                  <Progress
                                    value={project.completionPercentage || 0}
                                    className="h-1.5"
                                  />
                                </div>
                              </CardContent>
                            </Card>
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
