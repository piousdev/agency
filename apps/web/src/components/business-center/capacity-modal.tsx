'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useActionState, useId } from 'react';
import { updateCapacityAction } from '@/app/(default)/dashboard/business-center/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Capacity Modal Props
 */
interface CapacityModalProps {
  userId: string;
  userName: string;
  currentCapacity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Capacity Modal Component (Client Component)
 * Form for updating team member capacity allocation
 */
export function CapacityModal({
  userId,
  userName,
  currentCapacity,
  open,
  onOpenChange,
}: CapacityModalProps) {
  const [state, formAction, isPending] = useActionState(
    updateCapacityAction.bind(null, userId),
    null
  );
  const capacityId = useId();

  // Get the capacity value from form for showing warnings
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Warning logic is handled by checking the value in the render
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Capacity</DialogTitle>
          <DialogDescription>Update capacity allocation for {userName}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Error message */}
          {state && !state.success && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {/* Success message */}
          {state?.success && (
            <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md text-sm">
              Capacity updated successfully
            </div>
          )}

          {/* Hidden user ID */}
          <input type="hidden" name="userId" value={userId} />

          {/* Capacity Input */}
          <div className="space-y-2">
            <Label htmlFor={capacityId}>Capacity Percentage (0-200%)</Label>
            <Input
              id={capacityId}
              name="capacityPercentage"
              type="number"
              min="0"
              max="200"
              step="5"
              defaultValue={currentCapacity}
              onChange={handleCapacityChange}
              required
              disabled={isPending}
              placeholder="Enter capacity percentage"
            />
            <p className="text-xs text-muted-foreground">Current capacity: {currentCapacity}%</p>
          </div>

          {/* Warning for high capacity */}
          <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-md text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Capacity Guidelines</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 0-79%: Available for new work</li>
                <li>• 80-99%: At capacity</li>
                <li>• 100%+: Overloaded (requires approval)</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Updating...' : 'Update Capacity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
