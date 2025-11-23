'use client';

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
import { IconGripVertical, IconLoader2 } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { updateTicketPriorityAction } from '@/lib/actions/business-center/tickets';
import type { Ticket, TicketWithRelations } from '@/lib/api/tickets/types';
import { cn } from '@/lib/utils';

interface IntakeKanbanViewProps {
  tickets: TicketWithRelations[];
}

type TicketPriority = Ticket['priority'];

const priorities: readonly TicketPriority[] = ['critical', 'high', 'medium', 'low'];

const priorityLabels: Record<TicketPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const priorityColors: Record<TicketPriority, string> = {
  critical: 'bg-red-500/10 ring-red-500/30',
  high: 'bg-orange-500/10 ring-orange-500/30',
  medium: 'bg-amber-500/10 ring-amber-500/30',
  low: 'bg-muted ring-muted-foreground/20',
};

const priorityHeaderColors: Record<TicketPriority, string> = {
  critical: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-muted-foreground',
};

const typeConfig: Record<string, { label: string; color: string }> = {
  bug: {
    label: 'Bug',
    color: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/30',
  },
  feature: {
    label: 'Feature',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-500/30',
  },
  support: {
    label: 'Support',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30',
  },
  question: {
    label: 'Question',
    color: 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-500/30',
  },
};

const statusConfig: Record<string, { label: string; dot: string }> = {
  new: { label: 'New', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', dot: 'bg-amber-500' },
  pending: { label: 'Pending', dot: 'bg-purple-500' },
  resolved: { label: 'Resolved', dot: 'bg-emerald-500' },
  closed: { label: 'Closed', dot: 'bg-slate-400' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function IntakeKanbanView({ tickets: initialTickets }: IntakeKanbanViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Store tickets grouped by priority to maintain order within each column
  const [ticketsByPriority, setTicketsByPriority] = useState<
    Record<TicketPriority, TicketWithRelations[]>
  >(() => {
    const grouped = {} as Record<TicketPriority, TicketWithRelations[]>;
    for (const priority of priorities) {
      grouped[priority] = initialTickets.filter((t) => t.priority === priority);
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

    const newPriority = destination.droppableId as TicketPriority;
    const oldPriority = source.droppableId as TicketPriority;

    // Find the ticket being moved
    const sourceColumn = ticketsByPriority[oldPriority];
    const ticket = sourceColumn[source.index];
    if (!ticket) return;

    // Create new state with proper reordering
    setTicketsByPriority((prev) => {
      const newState = { ...prev };

      if (oldPriority === newPriority) {
        // Same column reorder
        const column = [...prev[oldPriority]];
        const removed = column.splice(source.index, 1)[0];
        if (removed) {
          column.splice(destination.index, 0, removed);
        }
        newState[oldPriority] = column;
      } else {
        // Cross-column move
        const sourceCol = [...prev[oldPriority]];
        const destCol = [...prev[newPriority]];
        const removed = sourceCol.splice(source.index, 1)[0];
        if (removed) {
          // Update the ticket priority
          const updatedTicket = { ...removed, priority: newPriority };
          destCol.splice(destination.index, 0, updatedTicket);
        }
        newState[oldPriority] = sourceCol;
        newState[newPriority] = destCol;
      }

      return newState;
    });

    // Only call API if priority actually changed
    if (newPriority !== oldPriority) {
      startTransition(async () => {
        const apiResult = await updateTicketPriorityAction(draggableId, newPriority);

        if (!apiResult.success) {
          // Revert optimistic update on failure
          setTicketsByPriority((prev) => {
            const newState = { ...prev };
            const destCol = [...prev[newPriority]];
            const sourceCol = [...prev[oldPriority]];
            // Find and remove the ticket from destination
            const idx = destCol.findIndex((t) => t.id === draggableId);
            if (idx !== -1) {
              const removed = destCol.splice(idx, 1)[0];
              if (removed) {
                // Revert priority and add back to source
                const revertedTicket = {
                  ...removed,
                  priority: oldPriority,
                } as TicketWithRelations;
                sourceCol.splice(source.index, 0, revertedTicket);
              }
            }
            newState[newPriority] = destCol;
            newState[oldPriority] = sourceCol;
            return newState;
          });
          toast.error(apiResult.error || 'Failed to update ticket priority');
        } else {
          toast.success(`Changed "${ticket.title}" priority to ${priorityLabels[newPriority]}`);
        }
      });
    }
  };

  const handleCardClick = (ticketId: string) => {
    router.push(`/dashboard/business-center/intake-queue/${ticketId}`);
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {priorities.map((priority) => (
          <div key={priority} className="min-w-0">
            <div className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <h3 className={cn('text-sm font-semibold', priorityHeaderColors[priority])}>
                  {priorityLabels[priority]}
                </h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {ticketsByPriority[priority].length}
                </span>
              </div>

              <Droppable droppableId={priority}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver && priorityColors[priority],
                      snapshot.isDraggingOver && 'ring-2'
                    )}
                  >
                    {ticketsByPriority[priority].length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border/50 text-sm text-muted-foreground">
                        No tickets
                      </div>
                    )}
                    {ticketsByPriority[priority].map((ticket, index) => {
                      const type = typeConfig[ticket.type] ?? {
                        label: ticket.type,
                        color: 'bg-muted text-muted-foreground',
                      };
                      const status = statusConfig[ticket.status] ?? {
                        label: ticket.status,
                        dot: 'bg-muted-foreground',
                      };

                      return (
                        <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                          {(
                            dragProvided: DraggableProvided,
                            dragSnapshot: DraggableStateSnapshot
                          ) => (
                            <div
                              role="button"
                              tabIndex={0}
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={cn(
                                'bg-card border rounded-lg p-3 transition-all cursor-pointer hover:shadow-md hover:border-border w-full text-left',
                                dragSnapshot.isDragging &&
                                  'shadow-lg ring-2 ring-primary/30 cursor-grabbing',
                                isPending && draggingId === ticket.id && 'opacity-70'
                              )}
                              onClick={() => !dragSnapshot.isDragging && handleCardClick(ticket.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCardClick(ticket.id);
                                }
                              }}
                            >
                              {/* Card Header: Type + Drag Handle */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-[10px] font-medium px-1.5 py-0 h-5',
                                    type.color
                                  )}
                                >
                                  {type.label}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {isPending && draggingId === ticket.id && (
                                    <IconLoader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                  )}
                                  <button
                                    type="button"
                                    {...(dragProvided.dragHandleProps ?? {})}
                                    className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconGripVertical className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-2">
                                {ticket.title}
                              </h4>

                              {/* Meta: Client + Date */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span className="truncate max-w-[60%]">
                                  {ticket.client?.name || 'No client'}
                                </span>
                                <span className="tabular-nums shrink-0">
                                  {format(new Date(ticket.createdAt), 'MMM d')}
                                </span>
                              </div>

                              {/* Footer: Assignee + Status */}
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                {ticket.assignedTo ? (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar className="h-5 w-5">
                                      {ticket.assignedTo.image && (
                                        <AvatarImage
                                          src={ticket.assignedTo.image}
                                          alt={ticket.assignedTo.name || ''}
                                        />
                                      )}
                                      <AvatarFallback className="text-[8px] font-medium bg-muted">
                                        {getInitials(
                                          ticket.assignedTo.name || ticket.assignedTo.email || '?'
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs truncate max-w-[70px]">
                                      {ticket.assignedTo.name?.split(' ')[0] ||
                                        ticket.assignedTo.email?.split('@')[0]}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-amber-600 dark:text-amber-500">
                                    Unassigned
                                  </span>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
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
