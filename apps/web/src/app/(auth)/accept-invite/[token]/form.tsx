'use client';

import { useActionState, useId } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import type { InvitationData } from '@/lib/api/invitations';
import { type AcceptInviteState, acceptInviteAction } from './actions';

interface AcceptInviteFormProps {
  token: string;
  invitation: InvitationData;
}

const initialState: AcceptInviteState = {
  errors: {},
  message: '',
};

/**
 * Client form component for accepting invitations
 * Uses useActionState for progressive enhancement with Server Actions
 */
export function AcceptInviteForm({ token, invitation }: AcceptInviteFormProps) {
  const boundAction = acceptInviteAction.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Accept Invitation</CardTitle>
        <CardDescription>Create your account to join the platform</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.errors?._form && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
              {state.errors._form.join(', ')}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={nameId}>Full Name</Label>
            <Input
              id={nameId}
              name="name"
              type="text"
              placeholder="John Doe"
              disabled={isPending}
              className={state?.errors?.name ? 'border-red-500' : ''}
              required
            />
            {state?.errors?.name && (
              <p className="text-sm text-red-600">{state.errors.name.join(', ')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              name="email"
              type="email"
              defaultValue={invitation.email}
              disabled={true}
              className="bg-gray-100 cursor-not-allowed"
              required
            />
            <p className="text-xs text-gray-500">Email is pre-filled from your invitation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={passwordId}>Password</Label>
            <PasswordInput
              id={passwordId}
              name="password"
              placeholder="Create a strong password"
              disabled={isPending}
              className={state?.errors?.password ? 'border-red-500' : ''}
              showStrengthIndicator={true}
              required
            />
            {state?.errors?.password && (
              <p className="text-sm text-red-600">{state.errors.password.join(', ')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={confirmPasswordId}>Confirm Password</Label>
            <PasswordInput
              id={confirmPasswordId}
              name="confirmPassword"
              placeholder="Confirm your password"
              disabled={isPending}
              className={state?.errors?.confirmPassword ? 'border-red-500' : ''}
              showStrengthIndicator={false}
              required
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-red-600">{state.errors.confirmPassword.join(', ')}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
