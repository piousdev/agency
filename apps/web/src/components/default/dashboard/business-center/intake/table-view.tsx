'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import {
  IconDots,
  IconExternalLink,
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconPlayerPause,
  IconCalculator,
  IconCheck,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { transitionRequest, cancelRequest } from '@/lib/actions/business-center/requests';
import { REQUEST_STAGE_LABELS, REQUEST_TYPE_LABELS } from '@/lib/schemas/request';
import { cn } from '@/lib/utils';

import type { Request } from '@/lib/api/requests/types';
import type { RequestStage, Priority } from '@/lib/schemas/request';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'border-destructive text-destructive bg-destructive/10',
  high: 'border-warning text-warning bg-warning/10',
  medium: 'border-primary text-primary bg-primary/10',
  low: 'border-success text-success bg-success/10',
};

const STAGE_VARIANTS: Record<RequestStage, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  in_treatment: 'default',
  on_hold: 'destructive',
  estimation: 'secondary',
  ready: 'outline',
};

// Valid stage transitions (matching API rules)
const VALID_TRANSITIONS: Record<RequestStage, RequestStage[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

interface TableViewProps {
  requests: Request[];
  onSuccess?: () => void;
  toolbarRightContent?: React.ReactNode;
}

export function TableView({
  requests: initialRequests,
  onSuccess,
  toolbarRightContent,
}: TableViewProps) {
  const router = useRouter();
  const [orderedRequests, setOrderedRequests] = useState(initialRequests);

  // Hold dialog state
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [pendingHoldRequest, setPendingHoldRequest] = useState<Request | null>(null);
  const [isSubmittingHold, setIsSubmittingHold] = useState(false);

  // Sync orderedRequests when requests prop changes
  useEffect(() => {
    setOrderedRequests(initialRequests);
  }, [initialRequests]);

  const handleRowOrderChange = (newRowIdOrder: string[]) => {
    setOrderedRequests((prev) => {
      const itemMap = new Map(prev.map((item) => [item.id, item]));
      const reordered = newRowIdOrder
        .map((id) => itemMap.get(id))
        .filter((item): item is Request => item !== undefined);
      const reorderedIds = new Set(newRowIdOrder);
      const remaining = prev.filter((item) => !reorderedIds.has(item.id));
      return [...reordered, ...remaining];
    });
  };

  const handleTransition = async (request: Request, newStage: RequestStage, reason?: string) => {
    const oldStage = request.stage;

    // Optimistically update
    setOrderedRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, stage: newStage } : r))
    );

    const result = await transitionRequest(request.id, newStage, reason);

    if (!result.success) {
      // Revert on failure
      setOrderedRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, stage: oldStage } : r))
      );
      toast.error(result.error || 'Failed to update stage');
    } else {
      toast.success(`Moved "${request.title}" to ${REQUEST_STAGE_LABELS[newStage]}`);
      onSuccess?.();
    }
  };

  const handleStageClick = (request: Request, newStage: RequestStage) => {
    if (newStage === 'on_hold') {
      setPendingHoldRequest(request);
      setHoldReason('');
      setHoldDialogOpen(true);
    } else {
      void handleTransition(request, newStage);
    }
  };

  const handleHoldSubmit = async () => {
    if (!pendingHoldRequest || !holdReason.trim()) return;

    setIsSubmittingHold(true);
    await handleTransition(pendingHoldRequest, 'on_hold', holdReason.trim());
    setIsSubmittingHold(false);
    setHoldDialogOpen(false);
    setPendingHoldRequest(null);
    setHoldReason('');
  };

  const handleHoldCancel = () => {
    setHoldDialogOpen(false);
    setPendingHoldRequest(null);
    setHoldReason('');
  };

  const handleCancelRequest = async (request: Request) => {
    const result = await cancelRequest(request.id);
    if (result.success) {
      toast.success(`Request "${request.title}" cancelled`);
      setOrderedRequests((prev) => prev.filter((r) => r.id !== request.id));
      onSuccess?.();
    } else {
      toast.error(result.error || 'Failed to cancel request');
    }
  };

  const columns = React.useMemo<ColumnDef<Request>[]>(
    () => {
      /* eslint-disable react/no-unstable-nested-components */
      return [
    {
      accessorKey: 'title',
      header: 'Request',
      cell: ({ row }) => (
        <div>
          <div className="font-medium max-w-[250px] truncate" title={row.original.title}>
            {row.original.title}
          </div>
          <div className="text-xs text-muted-foreground">{row.original.requestNumber}</div>
        </div>
      ),
      meta: {
        displayName: 'Request',
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {REQUEST_TYPE_LABELS[row.original.type]}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => {
        if (!value.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Type',
        filterType: 'multi-select' as const,
        filterOptions: Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => {
        const stage = row.original.stage;
        return <Badge variant={STAGE_VARIANTS[stage]}>{REQUEST_STAGE_LABELS[stage]}</Badge>;
      },
      filterFn: (row, id, value: string[]) => {
        if (!value.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Stage',
        filterType: 'multi-select' as const,
        filterOptions: Object.entries(REQUEST_STAGE_LABELS).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('text-xs', PRIORITY_COLORS[row.original.priority])}>
          {row.original.priority}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => {
        if (!value.length) return true;
        return value.includes(row.getValue(id));
      },
      meta: {
        displayName: 'Priority',
        filterType: 'multi-select' as const,
        filterOptions: [
          { label: 'Critical', value: 'critical' },
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
        ],
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
        </span>
      ),
      sortingFn: 'datetime',
      meta: {
        displayName: 'Created Date',
        filterType: 'date' as const,
      },
    },
    {
      accessorKey: 'desiredDeliveryDate',
      header: 'Desired Delivery',
      cell: ({ row }) => {
        const date = row.original.desiredDeliveryDate;
        if (!date) {
          return <span className="text-muted-foreground">Not set</span>;
        }
        const isOverdue = new Date(date) < new Date();
        return (
          <span className={isOverdue ? 'text-destructive font-medium' : ''}>
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
        );
      },
      sortingFn: 'datetime',
      meta: {
        displayName: 'Desired Delivery',
        filterType: 'date' as const,
      },
    },
  ];
      /* eslint-enable react/no-unstable-nested-components */
    },
    []
  );

  const handleRowClick = (row: Row<Request>) => {
    router.push(`/dashboard/business-center/intake/${row.original.id}`);
  };

  const renderRowActions = (row: Row<Request>) => {
    const request = row.original;
    const currentStage = request.stage;
    const validNextStages = VALID_TRANSITIONS[currentStage];

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IconDots className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/business-center/intake/${request.id}`);
            }}
          >
            <IconExternalLink className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/business-center/intake/${request.id}/edit`);
            }}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit Request
          </DropdownMenuItem>

          {validNextStages.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconArrowRight className="mr-2 h-4 w-4" />
                  Move to Stage
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {validNextStages.map((stage) => (
                    <DropdownMenuItem
                      key={stage}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStageClick(request, stage);
                      }}
                    >
                      {stage === 'on_hold' && <IconPlayerPause className="mr-2 h-4 w-4" />}
                      {stage === 'estimation' && <IconCalculator className="mr-2 h-4 w-4" />}
                      {stage === 'ready' && <IconCheck className="mr-2 h-4 w-4" />}
                      {stage === 'in_treatment' && <IconArrowRight className="mr-2 h-4 w-4" />}
                      {REQUEST_STAGE_LABELS[stage]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              void handleCancelRequest(request);
            }}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Cancel Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderBulkActions = (table: Table<Request>) => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Move to Stage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['in_treatment', 'on_hold', 'estimation', 'ready'] as RequestStage[]).map((stage) => (
              <DropdownMenuItem
                key={stage}
                onClick={async () => {
                  for (const row of selectedRows) {
                    const request = row.original;
                    const validStages = VALID_TRANSITIONS[request.stage];
                    if (validStages.includes(stage)) {
                      if (stage === 'on_hold') {
                        // Skip on_hold in bulk - requires reason
                        toast.info(`Skipped "${request.title}" - On Hold requires a reason`);
                      } else {
                        await handleTransition(request, stage);
                      }
                    }
                  }
                  table.resetRowSelection();
                }}
              >
                {REQUEST_STAGE_LABELS[stage]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (orderedRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No requests found matching your criteria
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={orderedRequests}
        config={{
          enableRowSelection: 'multi',
          enableColumnVisibility: true,
          enableColumnOrdering: true,
          enableColumnPinning: true,
          enableColumnResizing: true,
          enableSorting: true,
          enableGlobalFilter: true,
          enableColumnFilters: true,
          enableRowOrdering: true,
          enableVirtualization: orderedRequests.length > 100,
          estimatedRowHeight: 56,
          virtualTableHeight: 600,
          enableKeyboardNavigation: true,
        }}
        initialSorting={[{ id: 'createdAt', desc: true }]}
        onRowClick={handleRowClick}
        onRowOrderChange={handleRowOrderChange}
        renderRowActions={renderRowActions}
        renderBulkActions={renderBulkActions}
        emptyMessage="No requests found matching your criteria"
        tableCaption="Intake requests with stage, priority, and status information"
        getRowId={(row) => row.id}
        toolbarRightContent={toolbarRightContent}
      />

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
