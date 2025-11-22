/**
 * Invite Form Component
 * Client component for invitation creation with validation
 * Uses Server Action with useActionState
 */

'use client';

import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useId } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ActionState, createInvitationAction } from './actions';

const initialState: ActionState = {
  success: undefined,
  message: undefined,
  errors: {},
};

export function InviteForm() {
  const router = useRouter();
  const emailId = useId();
  const clientTypeId = useId();
  const [state, formAction, isPending] = useActionState(createInvitationAction, initialState);

  // Handle success - show toast and redirect
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'Invitation sent successfully!');

      // Show invitation link in dev mode
      if (state.invitationToken) {
        const link = `${window.location.origin}/accept-invite/${state.invitationToken}`;
        toast.info('Invitation Link (DEV ONLY)', {
          description: link,
          duration: 10000,
        });
      }

      // Redirect back to users list after short delay
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    }
  }, [state.success, state.message, state.invitationToken, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation Details</CardTitle>
        <CardDescription>Enter the email address and client type for the new user</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor={emailId}>
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id={emailId}
                name="email"
                type="email"
                placeholder="user@example.com"
                required
              />
            </div>
            {state.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Client Type field */}
          <div className="space-y-2">
            <Label htmlFor={clientTypeId}>
              Client Type <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Select name="clientType" defaultValue="creative" disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select client type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creative">Type A (Creative)</SelectItem>
                <SelectItem value="software">Type B (Software)</SelectItem>
                <SelectItem value="full_service">Type C (Full Service)</SelectItem>
                <SelectItem value="one_time">One-Time Project</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.clientType && (
              <p className="text-sm text-destructive">{state.errors.clientType[0]}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Select the type of client this user will be associated with
            </p>
          </div>

          {/* Error message */}
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {state.success && (
            <Alert className="border-success bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>{state.message} Redirecting to users list...</AlertDescription>
            </Alert>
          )}

          {/* Submit button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/users')}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
