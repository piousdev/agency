'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconRefresh, IconHome, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES - Single source of truth for type definitions
// ============================================================================

export type ErrorType = 'api' | 'network' | 'auth' | 'notFound' | 'server' | 'unknown';

export interface ErrorConfig {
  code: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  actionLabel?: string;
}

export interface ErrorDisplayProps {
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

export interface ErrorInlineProps {
  message: string;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

// ============================================================================
// CONFIGURATION - Centralized error configuration
// ============================================================================

const ERROR_CONFIG: Record<ErrorType, ErrorConfig> = {
  api: {
    code: '503',
    title: 'Service temporarily unavailable',
    message: "We're experiencing technical difficulties. Our team is working on it.",
    severity: 'high',
    actionLabel: 'Retry connection',
  },
  network: {
    code: 'Offline',
    title: 'Connection lost',
    message: 'Please check your internet connection and try again.',
    severity: 'medium',
    actionLabel: 'Reconnect',
  },
  auth: {
    code: '401',
    title: 'Authentication required',
    message: 'Your session has expired. Please sign in to continue.',
    severity: 'medium',
    actionLabel: 'Sign in',
  },
  notFound: {
    code: '404',
    title: 'Page not found',
    message: 'The page you are looking for seems to have wandered off.',
    severity: 'low',
    actionLabel: 'Go back',
  },
  server: {
    code: '500',
    title: 'Internal server error',
    message: 'Something went wrong on our end. Our team has been notified.',
    severity: 'high',
    actionLabel: 'Try again',
  },
  unknown: {
    code: 'Error',
    title: 'Unexpected error',
    message: 'An unexpected issue occurred. Please try again.',
    severity: 'medium',
    actionLabel: 'Retry',
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS - Pure functions for error detection and classification
// ============================================================================

/**
 * Analyzes error message/object to determine error type
 */
function detectErrorType(error: Error | string): ErrorType {
  const message = typeof error === 'string' ? error : error.message;
  const normalized = message.toLowerCase();

  const errorPatterns: Array<[ErrorType, string[]]> = [
    ['auth', ['unauthorized', 'sign in', '401', 'forbidden', '403', 'access denied']],
    ['network', ['network', 'connect', 'econnrefused', 'fetch failed', 'offline']],
    ['notFound', ['not found', '404']],
    ['server', ['500', 'internal server', 'server error']],
    ['api', ['503', 'service unavailable', 'unavailable']],
  ];

  for (const [type, patterns] of errorPatterns) {
    if (patterns.some((pattern) => normalized.includes(pattern))) {
      return type;
    }
  }

  return 'unknown';
}

/**
 * Creates complete error display props from an Error object
 */
export function createErrorProps(error: Error | string): ErrorDisplayProps {
  return {
    type: detectErrorType(error),
    details:
      process.env.NODE_ENV === 'development'
        ? typeof error === 'string'
          ? error
          : error.message
        : undefined,
  };
}

// ============================================================================
// HOOKS - Custom hooks for encapsulating component logic (SRP)
// ============================================================================

/**
 * Hook for managing error display state and actions
 */
function useErrorDisplay(props: ErrorDisplayProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const errorType = props.type || 'unknown';
  const config = ERROR_CONFIG[errorType];

  const displayCode = props.code || config.code;
  const displayTitle = props.title || config.title;
  const displayMessage = props.message || config.message;
  const isHighSeverity = config.severity === 'high';

  const handleRefresh = async () => {
    setIsRetrying(true);
    try {
      if (props.onRetry) {
        await props.onRetry();
      } else {
        router.refresh();
      }
    } finally {
      // Delay to show loading state
      setTimeout(() => setIsRetrying(false), 300);
    }
  };

  const handleGoBack = () => router.back();

  return {
    config,
    displayCode,
    displayTitle,
    displayMessage,
    isHighSeverity,
    isRetrying,
    handleRefresh,
    handleGoBack,
  };
}

/**
 * Hook for managing fade-in animation
 */
function useFadeIn(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
}

// ============================================================================
// PRESENTATION COMPONENTS - Focused, single-responsibility components
// ============================================================================

/**
 * Large decorative error code display
 */
function ErrorCodeDisplay({ code, isHighSeverity }: { code: string; isHighSeverity: boolean }) {
  const isVisible = useFadeIn(100);

  return (
    <div
      className={`
        transition-all duration-700 ease-out
        ${String(isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}
      `}
    >
      <h1
        className={`
          font-display text-[6rem] sm:text-[8rem] md:text-[10rem] 
          font-bold leading-none tracking-tighter select-none
          transition-colors duration-300
          ${
            isHighSeverity
              ? 'text-destructive/10 dark:text-destructive/15'
              : 'text-foreground/8 dark:text-foreground/12'
          }
        `}
        aria-hidden="true"
      >
        {code}
      </h1>
    </div>
  );
}

/**
 * Error title and message content
 */
function ErrorContent({ title, message }: { title: string; message: string }) {
  const isVisible = useFadeIn(200);

  return (
    <div
      className={`
        space-y-3 transition-all duration-700 ease-out delay-100
        ${String(isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}
      `}
    >
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed max-w-md mx-auto">
        {message}
      </p>
    </div>
  );
}

/**
 * Collapsible technical details section
 */
function ErrorDetails({ details }: { details?: string }) {
  if (!details) return null;

  return (
    <div className="mt-6 w-full max-w-lg">
      <details className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-colors hover:border-border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          <IconAlertCircle className="size-4 shrink-0" />
          <span>Technical details</span>
          <span className="ml-auto text-xs opacity-60">Click to expand</span>
        </summary>
        <div className="px-4 pb-4 pt-2">
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground leading-relaxed">
            {details}
          </pre>
        </div>
      </details>
    </div>
  );
}

/**
 * Action buttons for error recovery
 */
function ErrorActions({
  showGoBack,
  showRefresh,
  showReturnHome,
  isRetrying,
  actionLabel,
  onRefresh,
  onGoBack,
}: {
  showGoBack?: boolean;
  showRefresh?: boolean;
  showReturnHome?: boolean;
  isRetrying: boolean;
  actionLabel?: string;
  onRefresh: () => void;
  onGoBack: () => void;
}) {
  const isVisible = useFadeIn(300);

  return (
    <div
      className={`
        mt-8 flex flex-col sm:flex-row items-center justify-center gap-3
        transition-all duration-700 ease-out delay-200
        ${String(isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}
      `}
    >
      {showGoBack && (
        <Button variant="ghost" onClick={onGoBack} className="w-full sm:w-auto">
          <IconArrowLeft className="size-4" />
          Go back
        </Button>
      )}
      {showRefresh && (
        <Button
          onClick={onRefresh}
          disabled={isRetrying}
          className="w-full sm:w-auto min-w-[140px]"
        >
          <IconRefresh className={`size-4 ${String(isRetrying ? 'animate-spin' : '')}`} />
          {isRetrying ? 'Retrying...' : actionLabel || 'Try again'}
        </Button>
      )}
      {showReturnHome && (
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard">
            <IconHome className="size-4" />
            Dashboard
          </Link>
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENTS - Composition of presentation components
// ============================================================================

/**
 * Full-page error display with modern, minimalist design
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   type="notFound"
 *   showRefresh
 *   showReturnHome
 * />
 * ```
 */
export function ErrorDisplay(props: ErrorDisplayProps) {
  const {
    config,
    displayCode,
    displayTitle,
    displayMessage,
    isHighSeverity,
    isRetrying,
    handleRefresh,
    handleGoBack,
  } = useErrorDisplay(props);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="w-full max-w-2xl text-center">
        <ErrorCodeDisplay code={displayCode} isHighSeverity={isHighSeverity} />

        <ErrorContent title={displayTitle} message={displayMessage} />

        <ErrorDetails details={props.details} />

        <ErrorActions
          showGoBack={props.showGoBack}
          showRefresh={props.showRefresh}
          showReturnHome={props.showReturnHome}
          isRetrying={isRetrying}
          actionLabel={config.actionLabel}
          onRefresh={handleRefresh}
          onGoBack={handleGoBack}
        />
      </div>
    </div>
  );
}

/**
 * Compact inline error display for smaller contexts
 *
 * @example
 * ```tsx
 * <ErrorInline
 *   message="Failed to load data"
 *   onRetry={refetch}
 *   severity="warning"
 * />
 * ```
 */
export function ErrorInline({ message, onRetry, severity = 'error' }: ErrorInlineProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 300);
    }
  };

  const severityStyles = {
    error: 'bg-destructive/5 border-destructive/20 text-destructive',
    warning: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-500',
    info: 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-500',
  };

  const iconColor =
    severity === 'error'
      ? 'text-destructive'
      : severity === 'warning'
        ? 'text-yellow-600 dark:text-yellow-500'
        : 'text-blue-600 dark:text-blue-500';

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
        transition-colors duration-200
        ${severityStyles[severity]}
      `}
      role="alert"
    >
      <IconAlertCircle className={`size-5 shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-sm text-foreground/90 flex-1 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying}
          className="shrink-0 -mr-2"
        >
          <IconRefresh className={`size-3.5 ${String(isRetrying ? 'animate-spin' : '')}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS - Clean public API
// ============================================================================

export { ERROR_CONFIG, detectErrorType };
