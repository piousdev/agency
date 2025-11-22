'use client';

import { useEffect } from 'react';
import { ErrorDisplay, createErrorProps } from '@/components/ui/error-display';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  const errorProps = createErrorProps(error);

  return <ErrorDisplay {...errorProps} onRetry={reset} showReturnHome />;
}
