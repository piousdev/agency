'use client';

/**
 * Widget Container Component
 * Main container for dashboard widgets with consistent UI and behavior
 *
 * Features:
 * - Loading and error states
 * - Collapsible content
 * - Drag and drop support (edit mode)
 * - Action menu (refresh, configure, remove)
 * - Full accessibility support
 */

import { useId } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WidgetContainerProps } from '@/components/dashboard/business-center/overview/shared/components/widget-container/type';
import { WIDGET_CLASSES } from '@/components/dashboard/business-center/overview/shared/components/widget-container/constants';
import { WidgetHeader } from '@/components/dashboard/business-center/overview/shared/components/widget-container/components/header';
import { WidgetContentSkeleton } from '@/components/dashboard/business-center/overview/shared/components/widget-container/components/skeleton';
import { WidgetError } from '@/components/dashboard/business-center/overview/shared/components/widget-container/components/error';

/**
 * WidgetContainer - Unified container for all dashboard widgets
 *
 * Provides consistent structure and behavior for dashboard widgets including:
 * - Header with title, icon, and actions
 * - Content area with loading/error states
 * - Optional footer
 * - Collapse/expand functionality
 * - Drag and drop support
 * - Accessibility features
 *
 * @example
 * ```tsx
 * <WidgetContainer
 *   title="My Widget"
 *   icon={<IconDashboard />}
 *   isLoading={isLoading}
 *   onRefresh={handleRefresh}
 * >
 *   <WidgetContent />
 * </WidgetContainer>
 * ```
 */
export function WidgetContainer({
  title,
  icon,
  children,
  footer,
  isLoading,
  isError,
  onRefresh,
  onRemove,
  onConfigure,
  dragHandleProps,
  collapsed,
  onToggleCollapse,
  editMode,
  className,
  'aria-live': ariaLive,
  'aria-description': ariaDescription,
}: WidgetContainerProps) {
  const titleId = useId();

  // Prepare header callbacks
  const headerCallbacks = {
    onRefresh,
    onRemove,
    onConfigure,
  };

  // Determine content to display
  const contentElement = isLoading ? (
    <WidgetContentSkeleton />
  ) : isError ? (
    <WidgetError onRetry={onRefresh} />
  ) : (
    children
  );

  return (
    <Card
      className={cn(WIDGET_CLASSES.CONTAINER, className)}
      role="region"
      aria-labelledby={titleId}
      aria-live={ariaLive}
      aria-description={ariaDescription}
    >
      {/* Header with title and controls */}
      <WidgetHeader
        titleId={titleId}
        title={title}
        icon={icon}
        collapsed={collapsed}
        editMode={editMode}
        dragHandleProps={dragHandleProps}
        onToggleCollapse={onToggleCollapse}
        callbacks={headerCallbacks}
      />

      {/* Main content area */}
      <CardContent className={cn(WIDGET_CLASSES.CONTENT, collapsed && 'hidden')}>
        {contentElement}
      </CardContent>

      {/* Optional footer */}
      {footer && !collapsed && <CardFooter className={WIDGET_CLASSES.FOOTER}>{footer}</CardFooter>}
    </Card>
  );
}

WidgetContainer.displayName = 'WidgetContainer';
