'use client';

import React from 'react';

import { ErrorDisplay } from '@/components/ui/error-display';

type BusinessCenterError = Error & { digest?: string };

interface BusinessCenterErrorProps {
  readonly error: BusinessCenterError;
  readonly reset: () => void;
  readonly showGoBack?: boolean;
  readonly showReturnHome?: boolean;
}

/**
 * Error boundary component for the Business Center section.
 *
 * Displays a user-friendly error message when an error occurs within the Business Center.
 * In development mode, logs the error to the console for debugging purposes.
 *
 * @param props - The component props
 * @param props.error - The error object that was caught by the error boundary
 * @param props.reset - Function to reset the error boundary and retry rendering
 * @param props.showGoBack - Whether to display the "Go Back" button to the user. Defaults to `true`
 * @param props.showReturnHome - Whether to display the "Return Home" button to the user. Defaults to `true`
 *
 * @returns A React element displaying the error information with retry and navigation options
 *
 * @example
 * ```tsx
 * <BusinessCenterError
 *   error={new Error("Failed to load data")}
 *   reset={() => window.location.reload()}
 *   showGoBack={true}
 *   showReturnHome={true}
 * />
 * ```
 */
export default function BusinessCenterError({
  error,
  reset,
  showGoBack = true,
  showReturnHome = true,
}: BusinessCenterErrorProps): React.ReactElement {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error('Business Center Error:', error);
  }, [error]);
  const errorMessage =
    error.message.trim() || 'An unexpected error occurred in the Business Center.';
  const errorProps = {
    title: 'Business Center Error',
    message: errorMessage,
  };
  return (
    <ErrorDisplay
      {...errorProps}
      onRetry={reset}
      showGoBack={showGoBack}
      showReturnHome={showReturnHome}
    />
  );
}
