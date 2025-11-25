'use client';

/**
 * Widget Error Component
 * Error state display for dashboard widgets
 */

import { Button } from '@/components/ui/button';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { WidgetErrorProps } from '@/components/dashboard/business-center/overview/shared/components/widget-error/types';
import {
  ERROR_DEFAULTS,
  STATE_ARIA_LABELS,
  STATE_CLASSES,
  ICON_SIZES,
} from '@/components/dashboard/business-center/overview/shared/components/widget-error/constants';
import { shouldShowRetry } from '@/components/dashboard/business-center/overview/shared/components/widget-error/utils';
import { IconContainer } from '@/components/dashboard/business-center/overview/shared/components/widget-error/components/icon-container';

/**
 * Error state component for dashboard widgets
 * Displays error message with optional retry action
 *
 * Features:
 * - Customizable title and message
 * - Optional retry button
 * - Accessible with ARIA labels
 * - Consistent styling
 *
 * @example
 * ```tsx
 * <WidgetError
 *   title="Failed to load data"
 *   message="Unable to fetch dashboard metrics"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function WidgetError({
  title = ERROR_DEFAULTS.TITLE,
  message = ERROR_DEFAULTS.MESSAGE,
  onRetry,
  className,
}: WidgetErrorProps) {
  const showRetry = shouldShowRetry(onRetry);

  return (
    <div
      className={cn(STATE_CLASSES.CONTAINER, className)}
      role="alert"
      aria-label={STATE_ARIA_LABELS.ERROR_REGION}
    >
      {/* Error icon */}
      <IconContainer variant="error" size="md">
        <IconAlertTriangle className={ICON_SIZES.MD} />
      </IconContainer>

      {/* Error message */}
      <h3 className={STATE_CLASSES.TITLE}>{title}</h3>
      <p className={STATE_CLASSES.MESSAGE}>{message}</p>

      {/* Retry button */}
      {showRetry && (
        <div className={STATE_CLASSES.ACTION_WRAPPER}>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className={STATE_CLASSES.RETRY_BUTTON}
            aria-label={STATE_ARIA_LABELS.RETRY_ACTION}
          >
            <IconRefresh className={ICON_SIZES.SM} aria-hidden="true" />
            {ERROR_DEFAULTS.RETRY_BUTTON_TEXT}
          </Button>
        </div>
      )}
    </div>
  );
}

WidgetError.displayName = 'WidgetError';
