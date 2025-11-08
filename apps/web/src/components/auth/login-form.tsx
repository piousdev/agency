/**
 * Enhanced Login Form - Example of Server-First Pattern with UI State
 *
 * This component demonstrates:
 * ✅ Client component for form interactivity only
 * ✅ Uses authClient for authentication methods
 * ✅ Uses Zustand for UI preferences (remember email)
 * ✅ No session data in Zustand (that's in Better-Auth)
 * ✅ Progressive enhancement with loading states
 */

'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { useAuthUI } from '@/lib/stores/auth-ui';

interface EnhancedLoginFormProps {
  /**
   * Optional redirect URL after successful login
   * Typically passed from URL search params: ?returnUrl=/dashboard
   */
  returnUrl?: string;
}

export function EnhancedLoginForm({ returnUrl = '/dashboard' }: EnhancedLoginFormProps) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  // Zustand store for UI preferences (remember email)
  const { rememberEmail, savedEmail, setRememberEmail } = useAuthUI();

  // Local form state (temporary, resets on page reload)
  const [email, setEmail] = useState(savedEmail ?? '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      // Use Better-Auth client for sign in
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            // Save email preference if "remember me" is checked
            if (rememberEmail) {
              setRememberEmail(true, email);
            }

            // Redirect to return URL
            router.push(returnUrl);
          },
          onError: (ctx) => {
            setIsLoading(false);

            // Check if error is due to unverified email (HTTP 403)
            if (ctx.error.status === 403) {
              setNeedsVerification(true);
              setError(
                'Please verify your email address before signing in. Check your inbox for the verification link.'
              );
            } else {
              setNeedsVerification(false);
              setError(ctx.error.message || 'Failed to sign in. Please check your credentials.');
            }
          },
        }
      );
    } catch (_err) {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  /**
   * Resend verification email
   */
  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setIsResendingEmail(true);

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: '/verify-email',
      });

      setError('Verification email sent! Please check your inbox.');
      setNeedsVerification(false);
    } catch (err) {
      console.error('Resend verification error:', err);
      setError('Failed to resend verification email. Please try again later.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant={needsVerification ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{error}</p>
                  {needsVerification && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isResendingEmail}
                      className="mt-2"
                    >
                      {isResendingEmail ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          autoComplete="email"
          <div className="space-y-2">
            <Label htmlFor={passwordId}>Password</Label>
            <Input
              id={passwordId}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          autoComplete="current-password"
          <div className="flex items-center space-x-2">
            <Checkbox
              id={rememberId}
              checked={rememberEmail}
              onCheckedChange={(checked) => {
                setRememberEmail(!!checked, email);
              }}
              disabled={isLoading}
            />
            <Label htmlFor={rememberId} className="text-sm font-normal cursor-pointer">
              Remember my email
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
