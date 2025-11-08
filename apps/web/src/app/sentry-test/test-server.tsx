import { testServerAction, testServerActionWithError } from './actions';

/**
 * Server Component for testing server-side Sentry error tracking
 */
export async function TestServerComponent() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <form action={testServerAction}>
          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
          >
            Test Server Action (Success)
          </button>
        </form>

        <form action={testServerActionWithError}>
          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
          >
            Test Server Action (Error)
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
        <p className="font-semibold">What each button does:</p>
        <ul className="ml-6 mt-2 list-disc space-y-1">
          <li>
            <strong>Test Server Action (Success):</strong> Calls a server action that completes
            successfully
          </li>
          <li>
            <strong>Test Server Action (Error):</strong> Calls a server action that throws an error
          </li>
        </ul>
        <p className="mt-3 text-xs">
          Server errors will appear in your terminal/server logs with the prefix{' '}
          <code>🔍 [Sentry Dev Mode - Server]</code>
        </p>
      </div>
    </div>
  );
}
