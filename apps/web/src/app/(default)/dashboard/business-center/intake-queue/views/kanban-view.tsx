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
import { format } from 'date-fns';
import { Building2, Calendar, GripVertical, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  critical: 'bg-destructive/10 ring-destructive/30',
  high: 'bg-warning/10 ring-warning/30',
  medium: 'bg-info/10 ring-info/30',
  low: 'bg-muted ring-muted-foreground/20',
};

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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{priorityLabels[priority]}</h3>
                <Badge variant="secondary">{ticketsByPriority[priority].length}</Badge>
              </div>

              <Droppable droppableId={priority}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'space-y-3 min-h-[200px] rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver && priorityColors[priority],
                      snapshot.isDraggingOver && 'ring-2'
                    )}
                  >
                    {ticketsByPriority[priority].length === 0 && !snapshot.isDraggingOver && (
                      <Card className="border-dashed">
                        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                          No {priority} priority tickets
                        </CardContent>
                      </Card>
                    )}
                    {ticketsByPriority[priority].map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                        {(
                          dragProvided: DraggableProvided,
                          dragSnapshot: DraggableStateSnapshot
                        ) => (
                          <Card
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={cn(
                              'transition-shadow cursor-pointer hover:shadow-md',
                              dragSnapshot.isDragging &&
                                'shadow-lg ring-2 ring-primary/30 cursor-grabbing',
                              isPending && draggingId === ticket.id && 'opacity-70'
                            )}
                            onClick={() => !dragSnapshot.isDragging && handleCardClick(ticket.id)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start gap-2">
                                <div
                                  {...(dragProvided.dragHandleProps ?? {})}
                                  className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-sm line-clamp-2">
                                      {ticket.title}
                                    </CardTitle>
                                    {isPending && draggingId === ticket.id && (
                                      <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{ticket.client?.name || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>{format(new Date(ticket.createdAt), 'MMM d')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {ticket.assignedTo?.name || 'Unassigned'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="outline" className="text-xs">
                                  {ticket.type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {ticket.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        )}
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
