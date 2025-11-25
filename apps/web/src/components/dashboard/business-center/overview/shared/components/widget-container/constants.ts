/**
 * Widget Container Constants
 * Configuration and ARIA labels with deep immutability
 */

/**
 * ARIA labels for accessibility
 */
export const WIDGET_ARIA_LABELS = {
  DRAG_TO_REORDER: 'Drag to reorder',
  EXPAND_WIDGET: 'Expand widget',
  COLLAPSE_WIDGET: 'Collapse widget',
  WIDGET_OPTIONS: 'Widget options',
  LOADING_CONTENT: 'Loading widget content',
  LOADING_TEXT: 'Loading...',
  ERROR_UNABLE_TO_LOAD: 'Unable to load widget data',
  RETRY_LOADING: 'Retry loading',
} as const;

/**
 * Widget menu action labels
 */
export const WIDGET_MENU_LABELS = {
  REFRESH: 'Refresh',
  CONFIGURE: 'Configure',
  REMOVE: 'Remove',
} as const;

/**
 * Default widget container configuration
 */
export const WIDGET_DEFAULTS = {
  COLLAPSED: false,
  EDIT_MODE: false,
  LOADING: false,
  ERROR: false,
} as const;

/**
 * Widget skeleton variants configuration
 */
export const WIDGET_SKELETON_VARIANTS = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  DETAILED: 'detailed',
} as const;

/**
 * CSS class configurations
 */
export const WIDGET_CLASSES = {
  CONTAINER: 'flex flex-col gap-0 py-0 rounded-4xl',
  HEADER: 'flex flex-row items-center justify-between space-y-0 p-2',
  CONTENT: 'flex-1 px-2 pb-2 pt-0',
  FOOTER: 'px-2 pb-2 pt-0',
  DRAG_HANDLE: 'cursor-grab hover:bg-muted rounded p-1 touch-none shrink-0',
  ICON_BUTTON: 'size-6 shrink-0 rounded-xl',
  ERROR_CONTAINER: 'flex flex-col items-center justify-center py-8 text-center',
  ERROR_TEXT: 'text-sm text-muted-foreground mb-2',
  SKELETON_CONTAINER: 'space-y-3',
} as const;

/**
 * Icon sizes for consistency
 */
export const WIDGET_ICON_SIZES = {
  SM: 'size-4',
  MD: 'size-5',
} as const;
