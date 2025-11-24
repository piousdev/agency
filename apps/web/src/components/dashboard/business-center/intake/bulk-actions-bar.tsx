'use client';

import { IconX, IconArrowRight, IconUserPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIntakeStore, selectSelectedCount } from '@/lib/stores/intake-store';
import { REQUEST_STAGE_LABELS } from '@/lib/schemas/request';
import type { RequestStage } from '@/lib/schemas/request';

interface BulkActionsBarProps {
  onBulkTransition: (stage: RequestStage) => void;
  onBulkAssign: (pmId: string) => void;
  availablePMs?: Array<{ id: string; name: string }>;
  isTransitioning?: boolean;
}

export function BulkActionsBar({
  onBulkTransition,
  onBulkAssign,
  availablePMs = [],
  isTransitioning = false,
}: BulkActionsBarProps) {
  const selectedCount = useIntakeStore(selectSelectedCount);
  const { clearSelection } = useIntakeStore();

  if (selectedCount === 0) return null;

  const stages: RequestStage[] = ['in_treatment', 'on_hold', 'estimation', 'ready'];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-3 rounded-lg border bg-background p-3 shadow-lg">
        <span className="text-sm font-medium">{selectedCount} selected</span>

        <div className="h-4 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isTransitioning}>
              <IconArrowRight className="mr-2 h-4 w-4" />
              Move to Stage
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {stages.map((stage) => (
              <DropdownMenuItem key={stage} onClick={() => onBulkTransition(stage)}>
                {REQUEST_STAGE_LABELS[stage]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {availablePMs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isTransitioning}>
                <IconUserPlus className="mr-2 h-4 w-4" />
                Assign PM
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availablePMs.map((pm) => (
                <DropdownMenuItem key={pm.id} onClick={() => onBulkAssign(pm.id)}>
                  {pm.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="text-muted-foreground"
        >
          <IconX className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
