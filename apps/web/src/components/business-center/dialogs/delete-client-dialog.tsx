'use client';

import { useState } from 'react';

import { IconLoader2, IconAlertCircle, IconUserOff, IconAlertTriangle } from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deactivateClientAction } from '@/lib/actions/business-center/clients';

interface DeleteClientDialogProps {
  clientId: string;
  clientName: string;
  projectCount?: number;
  ticketCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteClientDialog({
  clientId,
  clientName,
  projectCount = 0,
  ticketCount = 0,
  open,
  onOpenChange,
  onSuccess,
}: DeleteClientDialogProps) {
  const hasAssociations = projectCount > 0 || ticketCount > 0;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    setIsPending(true);
    setError(null);

    try {
      const result = await deactivateClientAction(clientId);
      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconUserOff className="h-5 w-5 text-destructive" />
            Deactivate Client
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate this client?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm">
            <span className="font-medium">{clientName}</span> will be marked as inactive.
          </p>

          {/* Cascade Warning */}
          {hasAssociations && (
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <IconAlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">This client has associated records:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  {projectCount > 0 && (
                    <li>
                      {projectCount} project{projectCount !== 1 ? 's' : ''} will remain linked to
                      this client
                    </li>
                  )}
                  {ticketCount > 0 && (
                    <li>
                      {ticketCount} ticket{ticketCount !== 1 ? 's' : ''} will remain linked to this
                      client
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <p className="text-muted-foreground text-sm">
            Inactive clients are hidden from project and ticket selectors. You can reactivate them
            at any time by editing the client.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeactivate} disabled={isPending}>
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate Client
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
