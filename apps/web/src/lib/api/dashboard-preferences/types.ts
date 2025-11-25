/**
 * Dashboard preferences API types
 */

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetLayout {
  id: string;
  type: string;
  size: WidgetSize;
  position: number;
  visible: boolean;
}

export interface DashboardPreferences {
  layout: WidgetLayout[];
  collapsedWidgets: string[];
  isDefault?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SavePreferencesInput {
  layout: WidgetLayout[];
  collapsedWidgets?: string[];
}

export interface ResetPreferencesInput {
  role?: string;
}
