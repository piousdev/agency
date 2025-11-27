/**
 * Widget State Utilities
 * Pure utility functions for widget state management
 */

import {
  ICON_CONTAINER_CONFIG,
  ICON_SIZES,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-error/constants';

import type { IconContainerSize } from '@/components/default/dashboard/business-center/overview/shared/components/widget-error/types';

/**
 * Gets the icon container classes based on variant and size
 * @param variant - The state variant (error, empty, info)
 * @param size - The size of the container
 * @returns Combined CSS classes
 */
export const getIconContainerClasses = (
  variant: 'error' | 'empty' | 'info',
  size: IconContainerSize = 'md'
): string => {
  const config = ICON_CONTAINER_CONFIG[variant.toUpperCase() as keyof typeof ICON_CONTAINER_CONFIG];
  const sizeClass =
    size === 'sm' ? config.SIZE_SM : size === 'lg' ? config.SIZE_LG : config.SIZE_MD;

  return `${config.BASE} ${sizeClass}`;
};

/**
 * Gets the icon size classes based on container size
 * @param size - The container size
 * @returns Icon size CSS classes
 */
export const getIconSizeClasses = (size: IconContainerSize = 'md'): string => {
  return size === 'sm' ? ICON_SIZES.SM : size === 'lg' ? ICON_SIZES.LG : ICON_SIZES.MD;
};

/**
 * Gets the icon color classes based on variant
 * @param variant - The state variant
 * @returns Icon color CSS classes
 */
export const getIconColorClasses = (variant: 'error' | 'empty' | 'info'): string => {
  const config = ICON_CONTAINER_CONFIG[variant.toUpperCase() as keyof typeof ICON_CONTAINER_CONFIG];
  return config.ICON_COLOR;
};

/**
 * Determines if retry action should be shown
 * @param onRetry - Optional retry callback
 * @returns true if retry should be displayed
 */
export const shouldShowRetry = (onRetry?: () => void): boolean => Boolean(onRetry);

/**
 * Determines if action should be shown in empty state
 * @param action - Optional action element
 * @returns true if action should be displayed
 */
export const shouldShowAction = (action?: React.ReactNode): boolean => Boolean(action);

/**
 * Formats error message for display
 * @param message - Error message
 * @param maxLength - Maximum length before truncation
 * @returns Formatted message
 */
export const formatErrorMessage = (message: string, maxLength = 100): string => {
  if (message.length <= maxLength) return message;
  return `${message.substring(0, maxLength)}...`;
};
