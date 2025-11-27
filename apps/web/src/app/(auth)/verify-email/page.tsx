import { Suspense } from 'react';

import { VerifyEmailContent } from './verify-email-content';

/**
 * Email Verification Page
 *
 * Handles email verification via token in URL query parameter.
 *
 * Flow:
 * 1. User receives verification email with link
 * 2. User clicks link → lands on this page
 * 3. Token from URL is sent to Better-Auth API
 * 4. Email is marked as verified
 * 5. User is redirected to login
 *
 * URL Format: /verify-email?token=<verification-token>
 */
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Verify Email - Skyll Platform',
  description: 'Verify your email address to complete registration',
};
