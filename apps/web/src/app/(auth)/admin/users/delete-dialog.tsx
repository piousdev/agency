/**
 * Delete User Dialog Component (Client Component)
 * Confirmation dialog for deleting a user
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { deleteUserAction } from './actions';

interface DeleteUserDialogProps {
  userId: string | null;
  onClose: () => void;
}

export function DeleteUserDialog({ userId, onClose }: DeleteUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle user deletion
   */
  const handleDelete = async () => {
    if (!userId) return;

    setError(null);

    startTransition(async () => {
      try {
        const result = await deleteUserAction(userId);

        if (result.success) {
          toast.success(result.message || 'User deleted successfully');
          onClose();
          router.refresh();
        } else {
          setError(result.message || 'Failed to delete user');
          toast.error(result.message || 'Failed to delete user');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete user';
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <AlertDialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this user? This action cannot be undone. All associated
            data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
