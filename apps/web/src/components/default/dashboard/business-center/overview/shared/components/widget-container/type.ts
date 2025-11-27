/**
 * Widget Container Types
 * Immutable type definitions for widget container system
 */

import type { ReactNode } from 'react';

/**
 * ARIA live region settings for real-time updates
 */
export type AriaLiveValue = 'off' | 'polite' | 'assertive';

/**
 * Drag handle properties for reordering widgets
 */
export type DragHandleProps = Readonly<Record<string, unknown>>;

/**
 * Base widget container configuration
 */
export type WidgetContainerConfig = Readonly<{
  title: string;
  icon?: ReactNode;
  collapsed?: boolean;
  editMode?: boolean;
}>;

/**
 * Widget container callback handlers
 */
export type WidgetContainerCallbacks = Readonly<{
  onRefresh?: () => void;
  onRemove?: () => void;
  onConfigure?: () => void;
  onToggleCollapse?: () => void;
}>;

/**
 * Widget container state
 */
export type WidgetContainerState = Readonly<{
  isLoading?: boolean;
  isError?: boolean;
}>;

/**
 * Widget container accessibility props
 */
export type WidgetContainerAccessibility = Readonly<{
  'aria-live'?: AriaLiveValue;
  'aria-description'?: string;
}>;

/**
 * Complete widget container props
 */
export type WidgetContainerProps = WidgetContainerConfig &
  WidgetContainerCallbacks &
  WidgetContainerState &
  WidgetContainerAccessibility &
  Readonly<{
    children: ReactNode;
    footer?: ReactNode;
    dragHandleProps?: DragHandleProps;
    className?: string;
  }>;

/**
 * Widget error component props
 */
export type WidgetErrorProps = Readonly<{
  onRetry?: () => void;
  message?: string;
}>;

/**
 * Widget skeleton component props
 */
export type WidgetSkeletonProps = Readonly<{
  variant?: 'default' | 'compact' | 'detailed';
}>;
