'use client';

import { useState } from 'react';
import {
  IconArrowRight,
  IconUserPlus,
  IconEye,
  IconEdit,
  IconX,
  IconPlayerPause,
  IconPlayerPlay,
  IconCalculatorFilled,
  IconCheck,
} from '@tabler/icons-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Request } from '@/lib/api/requests/types';
import type { RequestStage } from '@/lib/schemas/request';
import { REQUEST_STAGE_LABELS } from '@/lib/schemas/request';

interface ActionSheetProps {
  request: Request;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onTransition?: (stage: RequestStage) => void;
  onAssignPm?: (pmId: string) => void;
  availablePMs?: Array<{ id: string; name: string }>;
}

const VALID_TRANSITIONS: Record<RequestStage, RequestStage[]> = {
  in_treatment: ['on_hold', 'estimation'],
  on_hold: ['in_treatment', 'estimation'],
  estimation: ['in_treatment', 'on_hold', 'ready'],
  ready: ['in_treatment', 'on_hold', 'estimation'],
};

const STAGE_ICONS: Record<RequestStage, typeof IconArrowRight> = {
  in_treatment: IconPlayerPlay,
  on_hold: IconPlayerPause,
  estimation: IconCalculatorFilled,
  ready: IconCheck,
};

export function ActionSheet({
  request,
  open,
  onOpenChange,
  onViewDetails,
  onEdit,
  onTransition,
  onAssignPm,
  availablePMs = [],
}: ActionSheetProps) {
  const [showPmList, setShowPmList] = useState(false);
  const validTargetStages = VALID_TRANSITIONS[request.stage] || [];

  const handleTransition = (stage: RequestStage) => {
    onTransition?.(stage);
    onOpenChange(false);
  };

  const handleAssignPm = (pmId: string) => {
    onAssignPm?.(pmId);
    setShowPmList(false);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="line-clamp-1">{request.title}</DrawerTitle>
          <DrawerDescription className="font-mono text-xs">
            {request.requestNumber}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {showPmList ? (
            // PM Selection View
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Assign Project Manager</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowPmList(false)}>
                  <IconX className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
              <div className="grid gap-2">
                {availablePMs.map((pm) => (
                  <Button
                    key={pm.id}
                    variant="outline"
                    className="justify-start h-12"
                    onClick={() => handleAssignPm(pm.id)}
                  >
                    <IconUserPlus className="h-4 w-4 mr-3" />
                    {pm.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Main Actions View
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-2">
                {onViewDetails && (
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    onClick={() => {
                      onViewDetails();
                      onOpenChange(false);
                    }}
                  >
                    <IconEye className="h-5 w-5" />
                    <span className="text-xs">View Details</span>
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    onClick={() => {
                      onEdit();
                      onOpenChange(false);
                    }}
                  >
                    <IconEdit className="h-5 w-5" />
                    <span className="text-xs">Edit</span>
                  </Button>
                )}
              </div>

              {/* Stage Transitions */}
              {onTransition && validTargetStages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Move to Stage</h4>
                  <div className="grid gap-2">
                    {validTargetStages.map((stage) => {
                      const StageIcon = STAGE_ICONS[stage];
                      return (
                        <Button
                          key={stage}
                          variant="outline"
                          className="justify-start h-12"
                          onClick={() => handleTransition(stage)}
                        >
                          <StageIcon className="h-4 w-4 mr-3" />
                          {REQUEST_STAGE_LABELS[stage]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assign PM */}
              {onAssignPm && availablePMs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Assignment</h4>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => setShowPmList(true)}
                  >
                    <IconUserPlus className="h-4 w-4 mr-3" />
                    {request.assignedPm
                      ? `Reassign (${request.assignedPm.name})`
                      : 'Assign Project Manager'}
                    <IconArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
