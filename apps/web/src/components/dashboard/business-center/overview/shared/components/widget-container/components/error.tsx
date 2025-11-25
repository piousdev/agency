'use client';

/**
 * Widget Error Component
 * Error state display with retry functionality
 */

import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';
import type { WidgetErrorProps } from '@/components/dashboard/business-center/overview/shared/components/widget-container/type';
import {
  WIDGET_ARIA_LABELS,
  WIDGET_CLASSES,
} from '@/components/dashboard/business-center/overview/shared/components/widget-container/constants';

/**
 * Displays error state for widget with optional retry action
 * Includes proper ARIA live region for screen reader announcements
 */
export function WidgetError({
  onRetry,
  message = WIDGET_ARIA_LABELS.ERROR_UNABLE_TO_LOAD,
}: WidgetErrorProps) {
  return (
    <div className={WIDGET_CLASSES.ERROR_CONTAINER} role="alert" aria-live="polite">
      <p className={WIDGET_CLASSES.ERROR_TEXT}>{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          aria-label={WIDGET_ARIA_LABELS.RETRY_LOADING}
        >
          <IconRefresh className="mr-2 size-4" aria-hidden="true" />
          {WIDGET_ARIA_LABELS.RETRY_LOADING}
        </Button>
      )}
    </div>
  );
}

WidgetError.displayName = 'WidgetError';
