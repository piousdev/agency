'use client';

import { useState } from 'react';

import * as Sentry from '@sentry/nextjs';

/**
 * Client Component for testing client-side Sentry error tracking
 */
export function TestClient() {
  const [apiResult, setApiResult] = useState<string>('');

  const triggerClientError = () => {
    throw new Error('Test Client Error: Thrown from React component');
  };

  const triggerClientCaptureException = () => {
    try {
      throw new Error('Test Client Error: Manually captured exception');
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test_type: 'client_manual',
        },
        extra: {
          description: 'This error was manually captured using Sentry.captureException',
        },
      });
      alert('Error captured! Check console/Sentry dashboard');
    }
  };

  const triggerClientCaptureMessage = () => {
    Sentry.captureMessage('Test Client Message: Custom log message', {
      level: 'warning',
      tags: {
        test_type: 'client_message',
      },
      extra: {
        description: 'This is a custom message captured with Sentry.captureMessage',
      },
    });
    alert('Message captured! Check console/Sentry dashboard');
  };

  const testApiRoute = async () => {
    try {
      setApiResult('Loading...');
      const res = await fetch('/api/sentry-test');
      const data = (await res.json()) as unknown;
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Sentry.captureException(error);
    }
  };

  const testApiRouteError = async () => {
    try {
      setApiResult('Loading...');
      const res = await fetch('/api/sentry-test?error=true');
      const data = (await res.json()) as unknown;
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Sentry.captureException(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={triggerClientError}
          className="rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
        >
          Throw Client Error
        </button>

        <button
          onClick={triggerClientCaptureException}
          className="rounded-lg bg-orange-600 px-4 py-3 font-medium text-white hover:bg-orange-700"
        >
          Capture Client Exception
        </button>

        <button
          onClick={triggerClientCaptureMessage}
          className="rounded-lg bg-yellow-600 px-4 py-3 font-medium text-white hover:bg-yellow-700"
        >
          Capture Client Message
        </button>

        <button
          onClick={testApiRoute}
          className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
        >
          Test API Route (Success)
        </button>

        <button
          onClick={testApiRouteError}
          className="rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700"
        >
          Test API Route (Error)
        </button>
      </div>

      {apiResult && (
        <div className="rounded-lg bg-gray-100 p-4">
          <p className="mb-2 font-semibold">API Result:</p>
          <pre className="overflow-auto text-sm">{apiResult}</pre>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
        <p className="font-semibold">What each button does:</p>
        <ul className="ml-6 mt-2 list-disc space-y-1">
          <li>
            <strong>Throw Client Error:</strong> Triggers an unhandled React error
          </li>
          <li>
            <strong>Capture Client Exception:</strong> Manually captures an error with
            Sentry.captureException
          </li>
          <li>
            <strong>Capture Client Message:</strong> Sends a custom message with
            Sentry.captureMessage
          </li>
          <li>
            <strong>Test API Route (Success):</strong> Calls API route that succeeds
          </li>
          <li>
            <strong>Test API Route (Error):</strong> Calls API route that throws an error
          </li>
        </ul>
      </div>
    </div>
  );
}
