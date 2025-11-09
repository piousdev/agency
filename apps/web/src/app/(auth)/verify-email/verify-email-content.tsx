'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

type VerificationState = 'verifying' | 'success' | 'error' | 'no-token';

/**
 * Email Verification Content Component
 *
 * Client component that handles the actual verification logic.
 * Uses Better-Auth API to verify the email token.
 */
export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email'); // Optional: can be passed for resend functionality

  useEffect(() => {
    if (!token) {
      setState('no-token');
      return;
    }

    verifyEmail(token);
  }, [token]);

  /**
   * Verify email using Better-Auth API
   */
  async function verifyEmail(verificationToken: string) {
    try {
      // Better-Auth automatically handles verification via the token parameter
      // The verification endpoint is: /api/auth/verify-email?token=<token>
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${verificationToken}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        setState('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Verification failed. The link may be expired or invalid.');
        setState('error');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError('An error occurred during verification. Please try again.');
      setState('error');
    }
  }

  /**
   * Resend verification email
   */
  async function handleResendEmail() {
    if (!email) {
      setError('Email address not available. Please try signing up again.');
      return;
    }

    setIsResending(true);

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: '/verify-email',
      });

      alert('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend email error:', err);
      setError('Failed to resend verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  }

  // No token in URL
  if (state === 'no-token') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">No Verification Token</CardTitle>
          <CardDescription>
            We couldn't find a verification token in the URL. Please check your email and click the
            verification link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verifying...
  if (state === 'verifying') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-lg font-medium text-gray-700">Verifying your email...</p>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </CardContent>
      </Card>
    );
  }

  // Success!
  if (state === 'success') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Email Verified!</CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm text-green-800">
              Redirecting you to the login page in 3 seconds...
            </p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-red-700">Verification Failed</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Common reasons for verification failure:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>The verification link has expired (24 hours)</li>
            <li>The link has already been used</li>
            <li>The link is invalid or corrupted</li>
          </ul>
        </div>

        {email && (
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        )}

        <Button onClick={() => router.push('/login')} className="w-full">
          Go to Login
        </Button>
      </CardContent>
    </Card>
  );
}
