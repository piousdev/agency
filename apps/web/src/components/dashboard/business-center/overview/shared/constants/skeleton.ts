/**
 * Widget Skeleton Constants
 * Deep immutable constants using const assertions
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
 */

/**
 * Default animation timings for skeleton components
 * Using const assertion for deep immutability
 */
export const ANIMATION_DEFAULTS = {
  STAGGER_DELAY: 75,
  FADE_DURATION: 300,
  SHIMMER_DURATION: 500,
} as const;

/**
 * Default skeleton configuration values
 */
export const SKELETON_DEFAULTS = {
  ROWS: 3,
  GRID_COUNT: 6,
  SHOW_HEADER: true,
  SHOW_FOOTER: true,
} as const;

/**
 * ARIA labels for accessibility
 */
export const ARIA_LABELS = {
  WIDGET_LOADING: 'Loading widget content',
  TASKS_LOADING: 'Loading tasks...',
  SPRINT_LOADING: 'Loading sprint data...',
  HEALTH_LOADING: 'Loading organization health...',
  TEAM_LOADING: 'Loading team status...',
  DEADLINES_LOADING: 'Loading deadlines...',
  ACTIVITY_LOADING: 'Loading activity...',
  BLOCKERS_LOADING: 'Loading blockers...',
  FINANCIAL_LOADING: 'Loading financial data...',
  RISK_LOADING: 'Loading risk data...',
  ALERTS_LOADING: 'Loading alerts...',
  MESSAGES_LOADING: 'Loading messages...',
  GENERIC_LOADING: 'Loading...',
} as const;

/**
 * Common skeleton dimensions
 */
export const SKELETON_DIMENSIONS = {
  ICON_SM: 'h-4 w-4',
  ICON_MD: 'h-5 w-5',
  ICON_LG: 'h-8 w-8',
  ICON_XL: 'h-20 w-20',
  BUTTON_SM: 'h-6 w-6',
  BUTTON_MD: 'h-8 w-8',
  TEXT_SM: 'h-3',
  TEXT_MD: 'h-4',
  TEXT_LG: 'h-5 w-32',
  BAR_SM: 'h-2',
  BAR_MD: 'h-3',
  AVATAR_SM: 'h-8 w-8',
  AVATAR_MD: 'h-10 w-10',
} as const;

/**
 * Grid layout configurations
 */
export const GRID_CONFIGS = {
  SINGLE_COL: 'grid-cols-1',
  TWO_COL: 'grid-cols-2',
  THREE_COL: 'grid-cols-3',
  RESPONSIVE: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;
