/**
 * Widget State Types
 * Type definitions for error and empty states
 */

import type { ReactNode } from 'react';

/**
 * Base widget state props
 */
export type BaseWidgetStateProps = Readonly<{
  className?: string;
}>;

/**
 * Widget error state configuration
 */
export type WidgetErrorConfig = Readonly<{
  title?: string;
  message?: string;
}>;

/**
 * Widget error props with callback
 */
export type WidgetErrorProps = BaseWidgetStateProps &
  WidgetErrorConfig &
  Readonly<{
    onRetry?: () => void;
  }>;

/**
 * Widget empty state configuration
 */
export type WidgetEmptyConfig = Readonly<{
  title: string;
  message?: string;
  icon?: ReactNode;
}>;

/**
 * Widget empty state props with action
 */
export type WidgetEmptyProps = BaseWidgetStateProps &
  WidgetEmptyConfig &
  Readonly<{
    action?: ReactNode;
  }>;

/**
 * Icon container size variants
 */
export const ICON_CONTAINER_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const;

export type IconContainerSize = (typeof ICON_CONTAINER_SIZES)[keyof typeof ICON_CONTAINER_SIZES];

/**
 * Icon container props
 */
export type IconContainerProps = Readonly<{
  children: ReactNode;
  variant: 'error' | 'empty' | 'info';
  size?: IconContainerSize;
  className?: string;
}>;
