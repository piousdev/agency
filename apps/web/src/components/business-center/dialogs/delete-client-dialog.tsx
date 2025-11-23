'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deactivateClientAction } from '@/lib/actions/business-center/clients';
import { IconLoader2, IconAlertCircle, IconUserOff } from '@tabler/icons-react';

interface DeleteClientDialogProps {
  clientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteClientDialog({
  clientId,
  clientName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteClientDialogProps) {
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

        <div className="py-4">
          <p className="text-sm">
            <span className="font-medium">{clientName}</span> will be marked as inactive.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
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
