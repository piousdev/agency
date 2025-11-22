'use client';

import { Loader2 } from 'lucide-react';
import { useActionState, useId } from 'react';
import { createIntakeAction } from '@/app/(default)/dashboard/business-center/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/**
 * Intake Form Props
 */
interface IntakeFormProps {
  clients: Array<{ id: string; name: string }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

/**
 * Intake Form Component (Client Component)
 * Form for creating new intake tickets with validation
 */
export function IntakeForm({ clients, open, onOpenChange, trigger }: IntakeFormProps) {
  const [state, formAction, isPending] = useActionState(createIntakeAction, null);
  const clientId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const priorityId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Intake Request</DialogTitle>
          <DialogDescription>Create a new client request or intake ticket</DialogDescription>
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
              Request created successfully
            </div>
          )}

          {/* Client select */}
          <div className="space-y-2">
            <Label htmlFor={clientId}>Client *</Label>
            <Select name="clientId" required>
              <SelectTrigger id={clientId}>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor={titleId}>Title *</Label>
            <Input
              id={titleId}
              name="title"
              placeholder="Brief description of the request"
              required
              maxLength={500}
              disabled={isPending}
            />
          </div>

          {/* Description textarea */}
          <div className="space-y-2">
            <Label htmlFor={descriptionId}>Description *</Label>
            <Textarea
              id={descriptionId}
              name="description"
              placeholder="Detailed description of the client request"
              required
              rows={5}
              disabled={isPending}
            />
          </div>
          {/* Priority select */}
          <div className="space-y-2">
            <Label htmlFor={priorityId}>Priority</Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger id={priorityId}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hidden type field - always 'intake' for this form */}
          <input type="hidden" name="type" value="intake" />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
