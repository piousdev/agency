'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import * as Sentry from '@sentry/nextjs';
import { IconRefresh, IconHome } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

/**
 * Error boundary for the dashboard route group
 * Renders within the dashboard layout - smaller variant
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="w-full max-w-md text-center">
        {/* Large Error Code */}
        <h1 className="font-display text-[6rem] sm:text-[8rem] font-bold leading-none tracking-tighter text-destructive/15 select-none">
          500
        </h1>

        {/* Title */}
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          An error occurred loading this page.
        </p>

        {/* Technical Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-left">
            <details className="group rounded-lg border border-border bg-card p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Technical details
              </summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted p-2 font-mono text-xs text-muted-foreground">
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset}>
            <IconRefresh className="size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <IconHome className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Error Reference */}
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground font-mono">Ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
