'use client';

import { useState } from 'react';

import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { REQUEST_STAGE_LABELS, type RequestStage } from '@/lib/schemas/request';

export type BulkActionType =
  | { type: 'transition'; stage: RequestStage }
  | { type: 'assign'; pmId: string; pmName: string };

interface BulkConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkActionType | null;
  selectedCount: number;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}

export function BulkConfirmationDialog({
  open,
  onOpenChange,
  action,
  selectedCount,
  onConfirm,
  isLoading = false,
}: BulkConfirmationDialogProps) {
  const [holdReason, setHoldReason] = useState('');

  if (!action) return null;

  const isHoldTransition = action.type === 'transition' && action.stage === 'on_hold';
  const requiresReason = isHoldTransition;

  const getTitle = () => {
    if (action.type === 'transition') {
      return `Move ${String(selectedCount)} request${selectedCount !== 1 ? 's' : ''} to ${REQUEST_STAGE_LABELS[action.stage]}?`;
    }
    return `Assign ${action.pmName} to ${String(selectedCount)} request${selectedCount !== 1 ? 's' : ''}?`;
  };

  const getDescription = () => {
    if (action.type === 'transition') {
      if (isHoldTransition) {
        return 'This will put the selected requests on hold. Please provide a reason.';
      }
      return `This will change the stage of ${String(selectedCount)} selected request${selectedCount !== 1 ? 's' : ''} to "${REQUEST_STAGE_LABELS[action.stage]}".`;
    }
    return `This will assign ${action.pmName} as the PM for ${String(selectedCount)} selected request${selectedCount !== 1 ? 's' : ''}.`;
  };

  const handleConfirm = () => {
    onConfirm(requiresReason ? holdReason : undefined);
    setHoldReason('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setHoldReason('');
    }
    onOpenChange(newOpen);
  };

  const isConfirmDisabled = isLoading || (requiresReason && !holdReason.trim());

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5 text-amber-500" />
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>

        {requiresReason && (
          <div className="space-y-2 py-4">
            <Label htmlFor="hold-reason">Hold Reason *</Label>
            <Textarea
              id="hold-reason"
              placeholder="Why are these requests being put on hold?"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirmDisabled}>
            {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Processing...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
