'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { IconRefresh, IconHome } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

/**
 * Global error boundary for runtime errors
 * Modern minimalist design with clear recovery options
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 bg-background">
      <div className="w-full max-w-lg text-center">
        {/* Large Error Code - Display Font */}
        <h1 className="font-display text-[8rem] sm:text-[10rem] font-bold leading-none tracking-tighter text-destructive/20 select-none">
          500
        </h1>

        {/* Title */}
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h2>

        {/* Description */}
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          An unexpected error occurred. Our team has been notified and is working to fix the issue.
        </p>

        {/* Technical Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 text-left">
            <details className="group rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Technical details
              </summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground">
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={reset}>
            <IconRefresh className="size-4" />
            Try again
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">
              <IconHome className="size-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Error Code Reference */}
        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground font-mono">
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
