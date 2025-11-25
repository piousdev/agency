/**
 * Widget State Constants
 * Configuration and default messages for error and empty states
 */

/**
 * Default error state messages
 */
export const ERROR_DEFAULTS = {
  TITLE: 'Failed to load',
  MESSAGE: 'Something went wrong while loading this widget.',
  RETRY_BUTTON_TEXT: 'Retry',
} as const;

/**
 * ARIA labels for widget states
 */
export const STATE_ARIA_LABELS = {
  ERROR_REGION: 'Error message',
  EMPTY_REGION: 'Empty state message',
  RETRY_ACTION: 'Retry loading widget',
} as const;

/**
 * CSS classes for widget states
 */
export const STATE_CLASSES = {
  CONTAINER: 'flex flex-col items-center justify-center h-full text-center p-6',
  TITLE: 'font-semibold text-sm',
  MESSAGE: 'text-sm text-muted-foreground mt-1 max-w-[200px]',
  ACTION_WRAPPER: 'mt-4',
  RETRY_BUTTON: 'gap-2',
} as const;

/**
 * Icon container configurations
 */
export const ICON_CONTAINER_CONFIG = {
  ERROR: {
    BASE: 'rounded-full bg-destructive/10 flex items-center justify-center mb-4',
    SIZE_SM: 'h-8 w-8',
    SIZE_MD: 'h-12 w-12',
    SIZE_LG: 'h-16 w-16',
    ICON_COLOR: 'text-destructive',
  },
  EMPTY: {
    BASE: 'rounded-full bg-muted flex items-center justify-center mb-4',
    SIZE_SM: 'h-8 w-8',
    SIZE_MD: 'h-12 w-12',
    SIZE_LG: 'h-16 w-16',
    ICON_COLOR: 'text-muted-foreground',
  },
  INFO: {
    BASE: 'rounded-full bg-primary/10 flex items-center justify-center mb-4',
    SIZE_SM: 'h-8 w-8',
    SIZE_MD: 'h-12 w-12',
    SIZE_LG: 'h-16 w-16',
    ICON_COLOR: 'text-primary',
  },
} as const;

/**
 * Icon sizes mapping
 */
export const ICON_SIZES = {
  SM: 'h-4 w-4',
  MD: 'h-6 w-6',
  LG: 'h-8 w-8',
} as const;
