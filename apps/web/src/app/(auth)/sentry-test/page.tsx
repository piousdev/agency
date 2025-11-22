import { Suspense } from 'react';
import { TestClient } from './test-client';
import { TestServerComponent } from './test-server';

/**
 * Sentry Testing Page
 *
 * This page provides various ways to test Sentry error tracking:
 * - Client-side errors
 * - Server-side errors
 * - Server Action errors
 * - API Route errors
 *
 * IMPORTANT: In development, errors are logged to console but NOT sent to Sentry
 * unless you set SENTRY_SEND_IN_DEV=true in your .env.local
 */
export default function SentryTestPage() {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Sentry Integration Test</h1>
        <div className="rounded-lg bg-warning/10 p-4 text-sm text-warning">
          <p className="mb-2 font-semibold">Development Mode:</p>
          <p>
            Errors will be <strong>logged to console</strong> but{' '}
            <strong>NOT sent to Sentry</strong> unless you set:
          </p>
          <code className="mt-2 block rounded bg-warning/20 p-2">SENTRY_SEND_IN_DEV=true</code>
          <p className="mt-2">Check the browser console and server logs to see Sentry events.</p>
        </div>
      </div>

      {/* Client-side tests */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Client-Side Error Tests</h2>
        <TestClient />
      </div>

      {/* Server-side tests */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Server-Side Error Tests</h2>
        <Suspense fallback={<div>Loading server tests...</div>}>
          <TestServerComponent />
        </Suspense>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-border bg-secondary/30 p-6">
        <h2 className="mb-4 text-xl font-semibold">Testing Instructions</h2>
        <ol className="space-y-3 text-sm">
          <li>
            <strong>1. Verify Environment Variables:</strong>
            <ul className="ml-6 mt-1 list-disc space-y-1">
              <li>
                Check that <code>NEXT_PUBLIC_SENTRY_DSN</code> is set in .env.local
              </li>
              <li>
                Check that <code>SENTRY_DSN</code> is set in .env.local
              </li>
            </ul>
          </li>
          <li>
            <strong>2. Development Testing (Console Only):</strong>
            <ul className="ml-6 mt-1 list-disc space-y-1">
              <li>Click any error button above</li>
              <li>Open browser console (F12) and server logs</li>
              <li>
                Look for: <code>🔍 [Sentry Dev Mode] Event would be sent:</code>
              </li>
            </ul>
          </li>
          <li>
            <strong>3. Send to Sentry in Development:</strong>
            <ul className="ml-6 mt-1 list-disc space-y-1">
              <li>
                Add to .env.local: <code>SENTRY_SEND_IN_DEV=true</code>
              </li>
              <li>Restart the dev server</li>
              <li>Click any error button above</li>
              <li>Check Sentry dashboard for the error</li>
            </ul>
          </li>
          <li>
            <strong>4. Production Testing:</strong>
            <ul className="ml-6 mt-1 list-disc space-y-1">
              <li>Build and run in production mode</li>
              <li>Errors will automatically be sent to Sentry</li>
              <li>Remember to remove this test page before deploying to production!</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
