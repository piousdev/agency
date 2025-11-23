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
import {
  IconGripVertical,
  IconLoader2,
  IconMail,
  IconPhone,
  IconWorld,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { updateClientFullAction } from '@/lib/actions/business-center/clients';
import type { Client } from '@/lib/api/clients/types';
import { cn } from '@/lib/utils';

interface ClientsKanbanViewProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewDetail?: (client: Client) => void;
}

type ClientType = Client['type'];

const clientTypes: readonly ClientType[] = ['software', 'creative', 'full_service'];

const typeLabels: Record<ClientType, string> = {
  software: 'Software',
  creative: 'Creative',
  full_service: 'Full Service',
};

const typeColors: Record<ClientType, string> = {
  software: 'bg-blue-500/10 ring-blue-500/30',
  creative: 'bg-purple-500/10 ring-purple-500/30',
  full_service: 'bg-emerald-500/10 ring-emerald-500/30',
};

const typeHeaderColors: Record<ClientType, string> = {
  software: 'text-blue-600 dark:text-blue-400',
  creative: 'text-purple-600 dark:text-purple-400',
  full_service: 'text-emerald-600 dark:text-emerald-400',
};

export function ClientsKanbanView({
  clients: initialClients,
  onEdit,
  onDelete,
  onViewDetail,
}: ClientsKanbanViewProps) {
  const [isPending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Store clients grouped by type to maintain order within each column
  const [clientsByType, setClientsByType] = useState<Record<ClientType, Client[]>>(() => {
    const grouped = {} as Record<ClientType, Client[]>;
    for (const type of clientTypes) {
      grouped[type] = initialClients.filter((c) => c.type === type);
    }
    return grouped;
  });

  // Sync clientsByType when initialClients prop changes (from filtering)
  useEffect(() => {
    const grouped = {} as Record<ClientType, Client[]>;
    for (const type of clientTypes) {
      grouped[type] = initialClients.filter((c) => c.type === type);
    }
    setClientsByType(grouped);
  }, [initialClients]);

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

    const newType = destination.droppableId as ClientType;
    const oldType = source.droppableId as ClientType;

    // Find the client being moved
    const sourceColumn = clientsByType[oldType];
    const client = sourceColumn[source.index];
    if (!client) return;

    // Create new state with proper reordering
    setClientsByType((prev) => {
      const newState = { ...prev };

      if (oldType === newType) {
        // Same column reorder
        const column = [...prev[oldType]];
        const removed = column.splice(source.index, 1)[0];
        if (removed) {
          column.splice(destination.index, 0, removed);
        }
        newState[oldType] = column;
      } else {
        // Cross-column move
        const sourceCol = [...prev[oldType]];
        const destCol = [...prev[newType]];
        const removed = sourceCol.splice(source.index, 1)[0];
        if (removed) {
          // Update the client type
          const updatedClient = { ...removed, type: newType };
          destCol.splice(destination.index, 0, updatedClient);
        }
        newState[oldType] = sourceCol;
        newState[newType] = destCol;
      }

      return newState;
    });

    // Only call API if type actually changed
    if (newType !== oldType) {
      startTransition(async () => {
        // Create FormData for the update action
        const formData = new FormData();
        formData.append('type', newType);

        const apiResult = await updateClientFullAction(draggableId, formData);

        if (!apiResult.success) {
          // Revert optimistic update on failure
          setClientsByType((prev) => {
            const newState = { ...prev };
            const destCol = [...prev[newType]];
            const sourceCol = [...prev[oldType]];
            // Find and remove the client from destination
            const idx = destCol.findIndex((c) => c.id === draggableId);
            if (idx !== -1) {
              const removed = destCol.splice(idx, 1)[0];
              if (removed) {
                // Revert type and add back to source
                const revertedClient = { ...removed, type: oldType };
                sourceCol.splice(source.index, 0, revertedClient);
              }
            }
            newState[newType] = destCol;
            newState[oldType] = sourceCol;
            return newState;
          });
          toast.error(apiResult.error || 'Failed to update client type');
        } else {
          toast.success(`Moved "${client.name}" to ${typeLabels[newType]}`);
        }
      });
    }
  };

  const handleCardClick = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetail) {
      onViewDetail(client);
    } else {
      onEdit(client);
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {clientTypes.map((type) => (
          <div key={type} className="min-w-0">
            <div className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <h3 className={cn('text-sm font-semibold', typeHeaderColors[type])}>
                  {typeLabels[type]}
                </h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {clientsByType[type].length}
                </span>
              </div>

              <Droppable droppableId={type}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver && typeColors[type],
                      snapshot.isDraggingOver && 'ring-2'
                    )}
                  >
                    {clientsByType[type].length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border/50 text-sm text-muted-foreground">
                        No clients
                      </div>
                    )}
                    {clientsByType[type].map((client, index) => (
                      <Draggable key={client.id} draggableId={client.id} index={index}>
                        {(
                          dragProvided: DraggableProvided,
                          dragSnapshot: DraggableStateSnapshot
                        ) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={cn(
                              'bg-card border rounded-lg p-3 transition-all cursor-pointer hover:shadow-md hover:border-border w-full text-left',
                              dragSnapshot.isDragging &&
                                'shadow-lg ring-2 ring-primary/30 cursor-grabbing',
                              isPending && draggingId === client.id && 'opacity-70'
                            )}
                            onClick={(e) => handleCardClick(client, e)}
                          >
                            {/* Card Header: Status + Drag Handle */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5">
                                {client.active ? (
                                  <IconCircleCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <IconCircleX className="h-4 w-4 text-muted-foreground" />
                                )}
                                <Badge
                                  variant={client.active ? 'default' : 'secondary'}
                                  className="text-[10px] font-medium px-1.5 py-0 h-5"
                                >
                                  {client.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                {isPending && draggingId === client.id && (
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
                              {client.name}
                            </h4>

                            {/* Contact Info */}
                            <div className="space-y-1.5 mb-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <IconMail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                              {client.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <IconPhone className="h-3 w-3 shrink-0" />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                              {client.website && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <IconWorld className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {new URL(client.website).hostname}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Footer: Created date */}
                            <div className="pt-2 border-t border-border/50">
                              <span className="text-[10px] text-muted-foreground">
                                Created {format(new Date(client.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
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
