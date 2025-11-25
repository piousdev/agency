/**
 * Dashboard preferences API client
 * Centralized exports for dashboard preferences operations
 */

export { getDashboardPreferences } from './get';
export { saveDashboardPreferences, resetDashboardPreferences } from './save';

export type {
  ApiResponse,
  DashboardPreferences,
  SavePreferencesInput,
  ResetPreferencesInput,
  WidgetLayout,
  WidgetSize,
} from './types';
