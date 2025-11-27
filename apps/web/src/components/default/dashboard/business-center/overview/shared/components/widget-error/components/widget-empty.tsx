'use client';

/**
 * Widget Empty Component
 * Empty state display for widgets with no data
 */

import {
  STATE_ARIA_LABELS,
  STATE_CLASSES,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-error/constants';
import { shouldShowAction } from '@/components/default/dashboard/business-center/overview/shared/components/widget-error/utils';
import { cn } from '@/lib/utils';

import { IconContainer } from './icon-container';

import type { WidgetEmptyProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-error/types';

/**
 * Empty state component for widgets with no data
 * Displays customizable message with optional icon and action
 *
 * Features:
 * - Customizable icon, title, and message
 * - Optional action element (button, link, etc.)
 * - Accessible with ARIA labels
 * - Consistent styling
 *
 * @example
 * ```tsx
 * <WidgetEmpty
 *   icon={<IconInbox />}
 *   title="No tasks yet"
 *   message="Create your first task to get started"
 *   action={<Button>Create Task</Button>}
 * />
 * ```
 */
export function WidgetEmpty({ icon, title, message, action, className }: WidgetEmptyProps) {
  const showAction = shouldShowAction(action);

  return (
    <div
      className={cn(STATE_CLASSES.CONTAINER, className)}
      role="status"
      aria-label={STATE_ARIA_LABELS.EMPTY_REGION}
    >
      {/* Optional icon */}
      {icon && (
        <IconContainer variant="empty" size="md">
          {icon}
        </IconContainer>
      )}

      {/* Title */}
      <h3 className={STATE_CLASSES.TITLE}>{title}</h3>

      {/* Optional message */}
      {message && <p className={STATE_CLASSES.MESSAGE}>{message}</p>}

      {/* Optional action */}
      {showAction && <div className={STATE_CLASSES.ACTION_WRAPPER}>{action}</div>}
    </div>
  );
}

WidgetEmpty.displayName = 'WidgetEmpty';
