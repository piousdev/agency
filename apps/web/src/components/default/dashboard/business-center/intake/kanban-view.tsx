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
import { IconGripVertical, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { transitionRequest } from '@/lib/actions/business-center/requests';
import { REQUEST_STAGE_LABELS, REQUEST_TYPE_LABELS } from '@/lib/schemas/request';
import { cn } from '@/lib/utils';

import type { Request } from '@/lib/api/requests/types';
import type { RequestStage, Priority } from '@/lib/schemas/request';

// Design token colors
const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'border-destructive text-destructive bg-destructive/10',
  high: 'border-warning text-warning bg-warning/10',
  medium: 'border-primary text-primary bg-primary/10',
  low: 'border-success text-success bg-success/10',
};

const KANBAN_STAGES: RequestStage[] = ['in_treatment', 'on_hold', 'estimation', 'ready'];
type KanbanStage = (typeof KANBAN_STAGES)[number];

const STAGE_COLORS: Record<KanbanStage, string> = {
  in_treatment: 'bg-primary/10 ring-primary/30',
  on_hold: 'bg-warning/10 ring-warning/30',
  estimation: 'bg-secondary/10 ring-secondary/30',
  ready: 'bg-success/10 ring-success/30',
};

const STAGE_HEADER_COLORS: Record<KanbanStage, string> = {
  in_treatment: 'text-primary',
  on_hold: 'text-warning',
  estimation: 'text-secondary-foreground',
  ready: 'text-success',
};

// Valid stage transitions (matching API rules)
const VALID_TRANSITIONS: Record<KanbanStage, KanbanStage[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

interface KanbanViewProps {
  requests: Request[];
}

function isValidTransition(from: KanbanStage, to: KanbanStage): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from].includes(to) || false;
}

export function KanbanView({ requests: initialRequests }: KanbanViewProps) {
  const _router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Store requests grouped by stage
  const [requestsByStage, setRequestsByStage] = useState<Record<KanbanStage, Request[]>>(() => {
    const grouped = {} as Record<KanbanStage, Request[]>;
    for (const stage of KANBAN_STAGES) {
      grouped[stage] = initialRequests.filter((r) => r.stage === stage);
    }
    return grouped;
  });

  // Hold dialog state
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [pendingHoldMove, setPendingHoldMove] = useState<{
    requestId: string;
    oldStage: KanbanStage;
    sourceIndex: number;
    destIndex: number;
  } | null>(null);
  const [isSubmittingHold, setIsSubmittingHold] = useState(false);

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

    const newStage = destination.droppableId as KanbanStage;
    const oldStage = source.droppableId as KanbanStage;

    // Find the request being moved
    const sourceColumn = requestsByStage[oldStage];
    const request = sourceColumn[source.index];
    if (!request) return;

    // Check if transition is valid
    if (!isValidTransition(oldStage, newStage)) {
      toast.error(
        `Cannot move from ${REQUEST_STAGE_LABELS[oldStage]} to ${REQUEST_STAGE_LABELS[newStage]}`
      );
      return;
    }

    // If moving to on_hold, show dialog first (don't update state yet)
    if (newStage === 'on_hold' && oldStage !== 'on_hold') {
      setPendingHoldMove({
        requestId: draggableId,
        oldStage,
        sourceIndex: source.index,
        destIndex: destination.index,
      });
      setHoldReason('');
      setHoldDialogOpen(true);
      return;
    }

    // Optimistically update state
    setRequestsByStage((prev) => {
      const newState = { ...prev };

      if (oldStage === newStage) {
        // Same column reorder
        const column = [...prev[oldStage]];
        const removed = column.splice(source.index, 1)[0];
        if (removed) {
          column.splice(destination.index, 0, removed);
        }
        newState[oldStage] = column;
      } else {
        // Cross-column move
        const sourceCol = [...prev[oldStage]];
        const destCol = [...prev[newStage]];
        const removed = sourceCol.splice(source.index, 1)[0];
        if (removed) {
          // Update the request stage
          const updatedRequest = { ...removed, stage: newStage };
          destCol.splice(destination.index, 0, updatedRequest);
        }
        newState[oldStage] = sourceCol;
        newState[newStage] = destCol;
      }

      return newState;
    });

    // Only call API if stage actually changed
    if (newStage !== oldStage) {
      startTransition(async () => {
        const apiResult = await transitionRequest(draggableId, newStage);

        if (!apiResult.success) {
          // Revert optimistic update on failure
          setRequestsByStage((prev) => {
            const newState = { ...prev };
            const destCol = [...prev[newStage]];
            const sourceCol = [...prev[oldStage]];
            // Find and remove the request from destination
            const idx = destCol.findIndex((r) => r.id === draggableId);
            if (idx !== -1) {
              const removed = destCol.splice(idx, 1)[0];
              if (removed) {
                // Revert stage and add back to source
                const revertedRequest = { ...removed, stage: oldStage };
                sourceCol.splice(source.index, 0, revertedRequest);
              }
            }
            newState[newStage] = destCol;
            newState[oldStage] = sourceCol;
            return newState;
          });
          toast.error(apiResult.error || 'Failed to move request');
        } else {
          toast.success(`Moved "${request.title}" to ${REQUEST_STAGE_LABELS[newStage]}`);
        }
      });
    }
  };

  const handleHoldSubmit = async () => {
    if (!pendingHoldMove || !holdReason.trim()) return;

    const { requestId, oldStage, sourceIndex, destIndex } = pendingHoldMove;
    const request = requestsByStage[oldStage][sourceIndex];
    if (!request) return;

    // Optimistically update state
    setRequestsByStage((prev) => {
      const newState = { ...prev };
      const sourceCol = [...prev[oldStage]];
      const destCol = [...prev.on_hold];
      const removed = sourceCol.splice(sourceIndex, 1)[0];
      if (removed) {
        const updatedRequest = { ...removed, stage: 'on_hold' as KanbanStage };
        destCol.splice(destIndex, 0, updatedRequest);
      }
      newState[oldStage] = sourceCol;
      newState.on_hold = destCol;
      return newState;
    });

    setIsSubmittingHold(true);
    try {
      const result = await transitionRequest(requestId, 'on_hold', holdReason.trim());
      if (result.success) {
        toast.success('Request moved to On Hold');
      } else {
        // Revert on failure
        setRequestsByStage((prev) => {
          const newState = { ...prev };
          const destCol = [...prev.on_hold];
          const sourceCol = [...prev[oldStage]];
          const idx = destCol.findIndex((r) => r.id === requestId);
          if (idx !== -1) {
            const removed = destCol.splice(idx, 1)[0];
            if (removed) {
              const revertedRequest = { ...removed, stage: oldStage };
              sourceCol.splice(sourceIndex, 0, revertedRequest);
            }
          }
          newState.on_hold = destCol;
          newState[oldStage] = sourceCol;
          return newState;
        });
        toast.error(result.error || 'Failed to put request on hold');
      }
    } catch {
      // Revert on error
      setRequestsByStage((prev) => {
        const newState = { ...prev };
        const destCol = [...prev.on_hold];
        const sourceCol = [...prev[oldStage]];
        const idx = destCol.findIndex((r) => r.id === requestId);
        if (idx !== -1) {
          const removed = destCol.splice(idx, 1)[0];
          if (removed) {
            const revertedRequest = { ...removed, stage: oldStage };
            sourceCol.splice(sourceIndex, 0, revertedRequest);
          }
        }
        newState.on_hold = destCol;
        newState[oldStage] = sourceCol;
        return newState;
      });
      toast.error('Failed to put request on hold');
    } finally {
      setIsSubmittingHold(false);
      setHoldDialogOpen(false);
      setPendingHoldMove(null);
      setHoldReason('');
    }
  };

  const handleHoldCancel = () => {
    setHoldDialogOpen(false);
    setPendingHoldMove(null);
    setHoldReason('');
  };

  return (
    <>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {KANBAN_STAGES.map((stage) => (
            <div key={stage} className="min-w-0">
              <div className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn('text-sm font-semibold', STAGE_HEADER_COLORS[stage])}>
                      {REQUEST_STAGE_LABELS[stage]}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {requestsByStage[stage].length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={stage}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
                        snapshot.isDraggingOver && STAGE_COLORS[stage],
                        snapshot.isDraggingOver && 'ring-2'
                      )}
                    >
                      {requestsByStage[stage].length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border/50 text-sm text-muted-foreground">
                          No requests
                        </div>
                      )}
                      {requestsByStage[stage].map((request, index) => (
                        <Draggable key={request.id} draggableId={request.id} index={index}>
                          {(
                            dragProvided: DraggableProvided,
                            dragSnapshot: DraggableStateSnapshot
                          ) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={cn(
                                'bg-card border rounded-lg p-3 transition-all',
                                dragSnapshot.isDragging && 'shadow-lg ring-2 ring-primary/30',
                                isPending && draggingId === request.id && 'opacity-70'
                              )}
                            >
                              {/* Card Header */}
                              <div className="flex items-start gap-2">
                                <button
                                  type="button"
                                  {...(dragProvided.dragHandleProps)}
                                  className="mt-1 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
                                >
                                  <IconGripVertical className="h-4 w-4" />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/dashboard/business-center/intake/${request.id}`}
                                    className="font-medium text-sm hover:underline line-clamp-2"
                                    onClick={(e) => dragSnapshot.isDragging && e.preventDefault()}
                                  >
                                    {request.title}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      {request.requestNumber}
                                    </span>
                                    {isPending && draggingId === request.id && (
                                      <IconLoader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge
                                  variant="outline"
                                  className={cn('text-xs', PRIORITY_COLORS[request.priority])}
                                >
                                  {request.priority}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {REQUEST_TYPE_LABELS[request.type]}
                                </Badge>
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

      {/* Hold Reason Dialog */}
      <Dialog open={holdDialogOpen} onOpenChange={(open) => !open && handleHoldCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Put Request On Hold</DialogTitle>
            <DialogDescription>
              Please provide a reason for putting this request on hold.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="hold-reason">Reason *</Label>
            <Textarea
              id="hold-reason"
              placeholder="Enter reason..."
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleHoldCancel} disabled={isSubmittingHold}>
              Cancel
            </Button>
            <Button onClick={handleHoldSubmit} disabled={isSubmittingHold || !holdReason.trim()}>
              {isSubmittingHold ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
