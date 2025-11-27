'use client';

import { useState, useMemo, useTransition, useCallback, useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  IconPlus,
  IconLayoutGrid,
  IconList,
  IconLayoutKanban,
  IconSearch,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { ActionSheet } from '@/components/default/dashboard/business-center/intake/action-sheet';
import { BulkActionsBar } from '@/components/default/dashboard/business-center/intake/bulk-actions-bar';
import {
  BulkConfirmationDialog,
  type BulkActionType,
} from '@/components/default/dashboard/business-center/intake/bulk-confirmation-dialog';
import { FilterPopover } from '@/components/default/dashboard/business-center/intake/filter-popover';
import { KanbanView } from '@/components/default/dashboard/business-center/intake/kanban-view';
import { Pagination } from '@/components/default/dashboard/business-center/intake/pagination';
import { RequestCard } from '@/components/default/dashboard/business-center/intake/request-card';
import { TableView } from '@/components/default/dashboard/business-center/intake/table-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  bulkTransitionRequests,
  bulkAssignPm,
  transitionRequest,
  assignPm,
} from '@/lib/actions/business-center/requests';
import { useIsTouchDevice } from '@/lib/hooks/use-mobile';
import { useIntakeSocket } from '@/lib/hooks/use-socket';
import { REQUEST_STAGE_LABELS } from '@/lib/schemas/request';
import {
  useIntakeStore,
  selectSelectedIds,
  selectSelectedCount,
  selectFilters,
} from '@/lib/stores/intake-store';

import type { Request, StageCounts } from '@/lib/api/requests/types';
import type { RequestStage } from '@/lib/schemas/request';

interface IntakeClientProps {
  initialRequests: Request[];
  initialStageCounts: StageCounts;
  availablePMs?: { id: string; name: string }[];
}

const EMPTY_PM_ARRAY: { id: string; name: string }[] = [];

export function IntakeClient({
  initialRequests,
  initialStageCounts,
  availablePMs = EMPTY_PM_ARRAY,
}: IntakeClientProps) {
  const router = useRouter();
  const { viewMode, setViewMode, activeStage, setActiveStage, clearSelection } = useIntakeStore();
  const selectedIds = useIntakeStore(selectSelectedIds);
  const selectedCount = useIntakeStore(selectSelectedCount);
  const filters = useIntakeStore(selectFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Card view pagination
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(6);

  // Hydration fix: wait for mount before using persisted store values
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // Using setTimeout to avoid cascading renders
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Mobile action sheet state
  const isTouchDevice = useIsTouchDevice();
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [actionSheetRequest, setActionSheetRequest] = useState<Request | null>(null);

  // Handle swipe action to open action sheet
  const handleSwipeAction = useCallback((request: Request) => {
    setActionSheetRequest(request);
    setActionSheetOpen(true);
  }, []);

  // Handle single request transition from action sheet
  const handleSingleTransition = useCallback(
    (stage: RequestStage) => {
      if (!actionSheetRequest) return;

      startTransition(async () => {
        const result = await transitionRequest(actionSheetRequest.id, stage);
        if (result.success) {
          toast.success(`Request moved to ${REQUEST_STAGE_LABELS[stage]}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to transition request');
        }
      });
    },
    [actionSheetRequest, router]
  );

  // Handle single request PM assignment from action sheet
  const handleSingleAssign = useCallback(
    (pmId: string) => {
      if (!actionSheetRequest) return;

      startTransition(async () => {
        const result = await assignPm(actionSheetRequest.id, pmId);
        if (result.success) {
          const pm = availablePMs.find((p) => p.id === pmId);
          toast.success(`Request assigned to ${pm?.name ?? 'PM'}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to assign PM');
        }
      });
    },
    [actionSheetRequest, availablePMs, router]
  );

  // Real-time socket events - auto refresh on changes
  const handleSocketEvent = useCallback(() => {
    router.refresh();
  }, [router]);

  const { lastEventTimestamp: _lastEventTimestamp } = useIntakeSocket({
    enabled: true,
    stage: activeStage !== 'all' ? activeStage : undefined,
    onCreated: (payload) => {
      toast.info(`New request: ${payload.title}`, {
        description: `Created by ${payload.requesterName}`,
        duration: 4000,
      });
      handleSocketEvent();
    },
    onStageChanged: (payload) => {
      toast.info(`Request moved: ${payload.requestTitle}`, {
        description: `${payload.fromStage} → ${payload.toStage} by ${payload.actorName}`,
        duration: 4000,
      });
      handleSocketEvent();
    },
    onEstimated: (payload) => {
      toast.info(`Request estimated: ${payload.requestTitle}`, {
        description: `${String(payload.storyPoints)} points (${payload.confidence}) by ${payload.estimatorName}`,
        duration: 4000,
      });
      handleSocketEvent();
    },
    onConverted: (payload) => {
      toast.success(`Request converted: ${payload.requestTitle}`, {
        description: `Converted to ${payload.convertedToType} by ${payload.actorName}`,
        duration: 4000,
      });
      handleSocketEvent();
    },
    onAssigned: (payload) => {
      toast.info(`Request assigned: ${payload.requestTitle}`, {
        description: `Assigned to ${payload.assignedPmName} by ${payload.actorName}`,
        duration: 4000,
      });
      handleSocketEvent();
    },
  });

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkActionType | null>(null);

  // Open confirmation dialog for transition
  const handleBulkTransition = (stage: RequestStage) => {
    if (selectedIds.length === 0) return;
    setPendingAction({ type: 'transition', stage });
    setConfirmDialogOpen(true);
  };

  // Open confirmation dialog for assign
  const handleBulkAssign = (pmId: string) => {
    if (selectedIds.length === 0) return;
    const pm = availablePMs.find((p) => p.id === pmId);
    if (!pm) return;
    setPendingAction({ type: 'assign', pmId, pmName: pm.name });
    setConfirmDialogOpen(true);
  };

  // Execute confirmed action
  const handleConfirmAction = (reason?: string) => {
    if (!pendingAction || selectedIds.length === 0) return;

    startTransition(async () => {
      if (pendingAction.type === 'transition') {
        const result = await bulkTransitionRequests(selectedIds, pendingAction.stage, reason);
        if (result.success) {
          const { successIds, failedIds } = result.data;
          if (failedIds.length === 0) {
            toast.success(
              `${String(successIds.length)} request${successIds.length !== 1 ? 's' : ''} moved to ${REQUEST_STAGE_LABELS[pendingAction.stage]}`
            );
          } else {
            toast.warning(
              `${String(successIds.length)} succeeded, ${String(failedIds.length)} failed`,
              {
                description: failedIds.map((f) => f.error).join(', '),
              }
            );
          }
          clearSelection();
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to transition requests');
        }
      } else {
        const result = await bulkAssignPm(selectedIds, pendingAction.pmId);
        if (result.success) {
          const { successIds, failedIds } = result.data;
          if (failedIds.length === 0) {
            toast.success(
              `${pendingAction.pmName} assigned to ${String(successIds.length)} request${successIds.length !== 1 ? 's' : ''}`
            );
          } else {
            toast.warning(
              `${String(successIds.length)} succeeded, ${String(failedIds.length)} failed`,
              {
                description: failedIds.map((f) => f.error).join(', '),
              }
            );
          }
          clearSelection();
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to assign PM');
        }
      }

      setConfirmDialogOpen(false);
      setPendingAction(null);
    });
  };

  // Apply all filters (stage, priority, type, dateRange)
  const applyFilters = useCallback(
    (requests: Request[]) => {
      return requests.filter((request) => {
        // Stage filter (from filter popover)
        if (filters.stage.length > 0 && !filters.stage.includes(request.stage)) {
          return false;
        }

        // Priority filter
        if (filters.priority.length > 0 && !filters.priority.includes(request.priority)) {
          return false;
        }

        // Type filter
        if (filters.type.length > 0 && !filters.type.includes(request.type)) {
          return false;
        }

        // Assigned PM filter
        if (filters.assignedPmId && request.assignedPmId !== filters.assignedPmId) {
          return false;
        }

        // Client filter
        if (filters.clientId && request.clientId !== filters.clientId) {
          return false;
        }

        // Date range filter (created date)
        if (filters.dateRange.from) {
          const requestDate = new Date(request.createdAt);
          if (requestDate < filters.dateRange.from) {
            return false;
          }
        }
        if (filters.dateRange.to) {
          const requestDate = new Date(request.createdAt);
          if (requestDate > filters.dateRange.to) {
            return false;
          }
        }

        return true;
      });
    },
    [filters]
  );

  // Stage-only filtered requests (for table view - it has its own search)
  const stageFilteredRequests = useMemo(() => {
    let result = initialRequests;

    // Apply stage filter
    if (activeStage !== 'all') {
      result = result.filter((request) => request.stage === activeStage);
    }

    // Apply all other filters
    return applyFilters(result);
  }, [initialRequests, activeStage, applyFilters]);

  // Filter requests based on active stage, filters, and search (for cards view)
  const filteredRequests = useMemo(() => {
    return stageFilteredRequests.filter((request) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          request.title.toLowerCase().includes(query) ||
          request.requestNumber.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [stageFilteredRequests, searchQuery]);

  // Kanban view: apply filters and search but NOT the stage tab (kanban shows all stages as columns)
  const kanbanFilteredRequests = useMemo(() => {
    let result = applyFilters(initialRequests);

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (request) =>
          request.title.toLowerCase().includes(query) ||
          request.requestNumber.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [initialRequests, applyFilters, searchQuery]);

  // Paginated requests for card view
  const paginatedRequests = useMemo(() => {
    const startIndex = (cardPage - 1) * cardPageSize;
    return filteredRequests.slice(startIndex, startIndex + cardPageSize);
  }, [filteredRequests, cardPage, cardPageSize]);

  const totalCardPages = Math.ceil(filteredRequests.length / cardPageSize);

  // Reset to page 1 when filters, search, or stage changes
  useEffect(() => {
    const timer = setTimeout(() => setCardPage(1), 0);
    return () => clearTimeout(timer);
  }, [activeStage, filters, searchQuery]);

  const stages: (RequestStage | 'all')[] = [
    'all',
    'in_treatment',
    'on_hold',
    'estimation',
    'ready',
  ];

  // Use default view mode during SSR to prevent hydration mismatch
  const effectiveViewMode = isMounted ? viewMode : 'cards';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Intake Pipeline</h1>
          <p className="text-muted-foreground">
            Manage incoming work requests through the intake pipeline
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/business-center/intake/new">
            <IconPlus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stage tabs */}
      <Tabs
        value={activeStage}
        onValueChange={(value) => setActiveStage(value as RequestStage | 'all')}
      >
        <TabsList className="h-auto flex-wrap justify-start">
          {stages.map((stage) => (
            <TabsTrigger key={stage} value={stage} className="gap-2">
              {stage === 'all' ? 'All' : REQUEST_STAGE_LABELS[stage]}
              <Badge variant="secondary" className="ml-1">
                {stage === 'all'
                  ? Object.values(initialStageCounts).reduce((a: number, b: number) => a + b, 0)
                  : initialStageCounts[stage]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Toolbar - hidden for table view which has its own */}
      {effectiveViewMode !== 'table' && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterPopover />
            <div className="flex rounded-md border">
              <Button
                variant={effectiveViewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none border-r"
                onClick={() => setViewMode('cards')}
                title="Card view"
              >
                <IconLayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={effectiveViewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none border-r"
                onClick={() => setViewMode('kanban')}
                title="Kanban view"
              >
                <IconLayoutKanban className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode('table')}
                title="Table view"
              >
                <IconList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold">No requests found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create a new request to get started'}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/business-center/intake/new">
                <IconPlus className="mr-2 h-4 w-4" />
                New Request
              </Link>
            </Button>
          )}
        </div>
      ) : effectiveViewMode === 'kanban' ? (
        <KanbanView requests={kanbanFilteredRequests} />
      ) : effectiveViewMode === 'cards' ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                enableSwipe={isTouchDevice}
                onSwipeAction={handleSwipeAction}
              />
            ))}
          </div>
          {filteredRequests.length > cardPageSize && (
            <Pagination
              currentPage={cardPage}
              totalPages={totalCardPages}
              totalItems={filteredRequests.length}
              pageSize={cardPageSize}
              onPageChange={setCardPage}
              onPageSizeChange={(size) => {
                setCardPageSize(size);
                setCardPage(1);
              }}
              pageSizeOptions={[6, 12, 24, 48]}
            />
          )}
        </div>
      ) : (
        <TableView
          requests={stageFilteredRequests}
          toolbarRightContent={
            <div className="flex items-center gap-2">
              <FilterPopover />
              <div className="flex rounded-md border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none border-r"
                  onClick={() => setViewMode('cards')}
                  title="Card view"
                >
                  <IconLayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none border-r"
                  onClick={() => setViewMode('kanban')}
                  title="Kanban view"
                >
                  <IconLayoutKanban className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('table')}
                  title="Table view"
                >
                  <IconList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        onBulkTransition={handleBulkTransition}
        onBulkAssign={handleBulkAssign}
        availablePMs={availablePMs}
        isTransitioning={isPending}
      />

      {/* Bulk Confirmation Dialog */}
      <BulkConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        action={pendingAction}
        selectedCount={selectedCount}
        onConfirm={handleConfirmAction}
        isLoading={isPending}
      />

      {/* Mobile Action Sheet */}
      {actionSheetRequest && (
        <ActionSheet
          request={actionSheetRequest}
          open={actionSheetOpen}
          onOpenChange={setActionSheetOpen}
          onViewDetails={() => {
            router.push(`/dashboard/business-center/intake/${actionSheetRequest.id}`);
          }}
          onEdit={() => {
            router.push(`/dashboard/business-center/intake/${actionSheetRequest.id}/edit`);
          }}
          onTransition={handleSingleTransition}
          onAssignPm={handleSingleAssign}
          availablePMs={availablePMs}
        />
      )}
    </div>
  );
}
