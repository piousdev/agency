'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconRefresh, IconHome, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export type ErrorType = 'api' | 'network' | 'auth' | 'notFound' | 'server' | 'unknown';

interface ErrorDisplayProps {
  type?: ErrorType;
  code?: string;
  title?: string;
  message?: string;
  details?: string;
  showRefresh?: boolean;
  showReturnHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
}

const errorConfig: Record<ErrorType, { code: string; title: string; message: string }> = {
  api: {
    code: '503',
    title: 'Service unavailable',
    message: 'The service is currently unreachable. Please try again later.',
  },
  network: {
    code: 'Network',
    title: 'Connection error',
    message: 'Unable to connect. Please check your internet connection.',
  },
  auth: {
    code: '401',
    title: 'Access denied',
    message: 'Your session may have expired. Please sign in again.',
  },
  notFound: {
    code: '404',
    title: 'Not found',
    message: "The resource you're looking for doesn't exist.",
  },
  server: {
    code: '500',
    title: 'Server error',
    message: 'An unexpected error occurred. Our team has been notified.',
  },
  unknown: {
    code: 'Error',
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

function detectErrorType(error: Error | string): ErrorType {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('sign in') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('403') ||
    lowerMessage.includes('access denied')
  ) {
    return 'auth';
  }
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('connect') ||
    lowerMessage.includes('econnrefused') ||
    lowerMessage.includes('fetch failed')
  ) {
    return 'api';
  }
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return 'notFound';
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('internal server')) {
    return 'server';
  }

  return 'unknown';
}

/**
 * Reusable error display component with modern minimalist design
 * Uses large typography and clear action buttons
 */
export function ErrorDisplay({
  type,
  code,
  title,
  message,
  details,
  showRefresh = true,
  showReturnHome = false,
  showGoBack = false,
  onRetry,
}: ErrorDisplayProps) {
  const router = useRouter();
  const errorType = type || 'unknown';
  const config = errorConfig[errorType];

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  const displayCode = code || config.code;
  const isDestructive = ['500', '503', 'Error', 'Network'].includes(displayCode);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-12">
      <div className="w-full max-w-md text-center">
        {/* Large Error Code */}
        <h1
          className={`font-display text-[5rem] sm:text-[7rem] font-bold leading-none tracking-tighter select-none ${
            isDestructive ? 'text-destructive/15' : 'text-foreground/10'
          }`}
        >
          {displayCode}
        </h1>

        {/* Title */}
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title || config.title}
        </h2>

        {/* Message */}
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {message || config.message}
        </p>

        {/* Technical Details (Development Only) */}
        {details && (
          <div className="mt-4 text-left">
            <details className="group rounded-lg border border-border bg-card p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Technical details
              </summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted p-2 font-mono text-xs text-muted-foreground">
                {details}
              </pre>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {showGoBack && (
            <Button variant="ghost" onClick={() => router.back()}>
              <IconArrowLeft className="size-4" />
              Go back
            </Button>
          )}
          {showRefresh && (
            <Button onClick={handleRefresh}>
              <IconRefresh className="size-4" />
              Try again
            </Button>
          )}
          {showReturnHome && (
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <IconHome className="size-4" />
                Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline error display for smaller contexts
 */
export function ErrorInline({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
      <IconAlertCircle className="size-5 text-destructive flex-shrink-0" />
      <p className="text-sm text-foreground flex-1">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="flex-shrink-0">
          <IconRefresh className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Helper function to create ErrorDisplay props from an Error
 */
export function createErrorProps(error: Error | string): ErrorDisplayProps {
  const message = typeof error === 'string' ? error : error.message;
  return {
    type: detectErrorType(error),
    details: process.env.NODE_ENV === 'development' ? message : undefined,
  };
}
