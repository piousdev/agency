'use server';

import { redirect } from 'next/navigation';

import { acceptInvitation } from '@/lib/api/invitations';

export interface AcceptInviteState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
  message?: string;
}

/**
 * Server Action to accept invitation and create user account
 * Validates input, calls Hono API server-to-server, handles errors
 */
export async function acceptInviteAction(
  token: string,
  _prevState: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  // Extract form data
  const name = formData.get('name') as string | null;
  const email = formData.get('email') as string | null;
  const password = formData.get('password') as string | null;
  const confirmPassword = formData.get('confirmPassword') as string | null;

  // Server-side validation
  const errors: AcceptInviteState['errors'] = {};

  if (!name || name.length < 2) {
    errors.name = ['Name must be at least 2 characters'];
  }

  if (!email?.includes('@')) {
    errors.email = ['Please enter a valid email address'];
  }

  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters'];
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = ['Password must contain uppercase, lowercase, and number'];
  }

  // eslint-disable-next-line security/detect-possible-timing-attacks -- Password comparison is intentional, not a timing attack vulnerability
  if (password !== confirmPassword) {
    errors.confirmPassword = ["Passwords don't match"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Call Hono API server-to-server
  try {
    await acceptInvitation({
      token,
      name: name ?? '',
      email: email ?? '',
      password: password ?? '',
    });

    // Success - redirect to login with email verification message
    redirect(
      '/login?message=Account created! Please check your email to verify your account before signing in.'
    );
  } catch (error) {
    console.error('Accept invitation error:', error);

    return {
      errors: {
        _form: [
          error instanceof Error ? error.message : 'Failed to create account. Please try again.',
        ],
      },
    };
  }
}
