'use client';

import * as React from 'react';

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import {
  fetchDashboardPreferences,
  updateDashboardPreferences,
  resetToDefaultPreferences,
} from '@/lib/actions/business-center/dashboard-preferences';

// Widget size options
export type WidgetSize = 'small' | 'medium' | 'large';

// Widget-specific configuration types
export interface MyWorkTodayConfig {
  showCompleted: boolean;
  priorityFilter: 'all' | 'urgent' | 'high' | 'medium' | 'low';
  maxItems: number;
}

export interface RecentActivityConfig {
  filterCategory: 'all' | 'tickets' | 'projects' | 'clients' | 'files' | 'comments';
  maxItems: number;
}

export interface UpcomingDeadlinesConfig {
  daysAhead: number;
  deadlineTypes: ('task' | 'project' | 'milestone' | 'meeting' | 'invoice')[];
}

export interface CurrentSprintConfig {
  showBurndown: boolean;
  showVelocity: boolean;
}

export interface OrganizationHealthConfig {
  showTrends: boolean;
}

export interface TeamStatusConfig {
  showUtilization: boolean;
}

// Union type for all widget configs
export type WidgetConfig =
  | { type: 'my-work-today'; config: MyWorkTodayConfig }
  | { type: 'recent-activity'; config: RecentActivityConfig }
  | { type: 'upcoming-deadlines'; config: UpcomingDeadlinesConfig }
  | { type: 'current-sprint'; config: CurrentSprintConfig }
  | { type: 'organization-health'; config: OrganizationHealthConfig }
  | { type: 'team-status'; config: TeamStatusConfig };

// Default configurations for each widget type
export const DEFAULT_WIDGET_CONFIGS: Record<string, Record<string, unknown>> = {
  'my-work-today': {
    showCompleted: false,
    priorityFilter: 'all',
    maxItems: 10,
  } satisfies MyWorkTodayConfig,
  'recent-activity': {
    filterCategory: 'all',
    maxItems: 10,
  } satisfies RecentActivityConfig,
  'upcoming-deadlines': {
    daysAhead: 14,
    deadlineTypes: ['task', 'project', 'milestone', 'meeting', 'invoice'],
  } satisfies UpcomingDeadlinesConfig,
  'current-sprint': {
    showBurndown: true,
    showVelocity: true,
  } satisfies CurrentSprintConfig,
  'organization-health': {
    showTrends: true,
  } satisfies OrganizationHealthConfig,
  'team-status': {
    showUtilization: true,
  } satisfies TeamStatusConfig,
};

// Widget layout item
export interface WidgetLayout {
  id: string;
  type: string;
  size: WidgetSize;
  position: number;
  visible: boolean;
}

// Known role keys
type RoleKey = 'admin' | 'pm' | 'developer' | 'designer' | 'qa' | 'client';

// Role-specific default layouts (used as fallback when database is unavailable)
const DEFAULT_LAYOUTS: Record<RoleKey, WidgetLayout[]> = {
  admin: [
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 0, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 1, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 5,
      visible: true,
    },
  ],
  pm: [
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 0, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 1, visible: true },
    { id: 'my-work-today', type: 'my-work-today', size: 'medium', position: 2, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 3, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 4, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 5,
      visible: true,
    },
  ],
  developer: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
  ],
  designer: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 2,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 3, visible: true },
  ],
  qa: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
  ],
  client: [
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 0,
      visible: true,
    },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 1,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 2, visible: true },
  ],
};

interface DashboardState {
  // Loading/sync state
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  error: string | null;

  // Layout state
  layout: WidgetLayout[];
  editMode: boolean;
  collapsedWidgets: string[];
  widgetConfigs: Record<string, Record<string, unknown>>;

  // Async actions
  initialize: () => Promise<void>;
  saveToDatabase: () => void;

  // Sync actions
  setLayout: (layout: WidgetLayout[]) => void;
  reorderWidgets: (oldIndex: number, newIndex: number) => void;
  toggleEditMode: () => void;
  toggleWidgetCollapse: (widgetId: string) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  addWidget: (widget: WidgetLayout) => void;
  removeWidget: (widgetId: string) => void;
  applyPreset: (role: string) => void;
  resetToDefault: () => Promise<void>;
  setWidgetConfig: (widgetId: string, config: Record<string, unknown>) => void;
  getWidgetConfig: (widgetId: string, widgetType: string) => Record<string, unknown>;

  // Helpers
  getDefaultLayoutForRole: (role: string) => WidgetLayout[];
}

// Debounce helper
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000;

export const useDashboardStore = create<DashboardState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      isLoading: false,
      isSaving: false,
      isInitialized: false,
      error: null,
      layout: DEFAULT_LAYOUTS.developer, // Default fallback
      editMode: false,
      collapsedWidgets: [],
      widgetConfigs: {},

      // Initialize from database
      initialize: async () => {
        const state = get();
        if (state.isInitialized || state.isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const result = await fetchDashboardPreferences();

          if (result.success) {
            set({
              layout: result.data.layout,
              collapsedWidgets: result.data.collapsedWidgets,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            // Use defaults if fetch fails
            set({
              isLoading: false,
              isInitialized: true,
              error: result.error,
            });
          }
        } catch (error) {
          console.error('Failed to initialize dashboard preferences:', error);
          set({
            isLoading: false,
            isInitialized: true,
            error: 'Failed to load preferences',
          });
        }
      },

      // Save to database (debounced)
      saveToDatabase: () => {
        const state = get();

        // Clear existing timeout
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }

        // Debounce the save
        saveTimeout = setTimeout(() => {
          set({ isSaving: true });

          void (async () => {
            try {
              const result = await updateDashboardPreferences({
                layout: state.layout,
                collapsedWidgets: state.collapsedWidgets,
              });

              if (!result.success) {
                console.error('Failed to save preferences:', result.error);
              }
            } catch (error) {
              console.error('Failed to save preferences:', error);
            } finally {
              set({ isSaving: false });
            }
          })();
        }, SAVE_DEBOUNCE_MS);
      },

      // Set entire layout
      setLayout: (layout) => {
        set({ layout });
        get().saveToDatabase();
      },

      // Reorder widgets by index
      reorderWidgets: (oldIndex, newIndex) => {
        set((state) => {
          const newLayout = [...state.layout];
          const removed = newLayout.splice(oldIndex, 1)[0];
          if (!removed) return state; // Guard against invalid index
          newLayout.splice(newIndex, 0, removed);
          // Update positions
          return {
            layout: newLayout.map((widget, idx) => ({
              ...widget,
              position: idx,
            })),
          };
        });
        get().saveToDatabase();
      },

      // Toggle edit mode
      toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),

      // Toggle widget collapse state
      toggleWidgetCollapse: (widgetId) => {
        set((state) => {
          const collapsed = new Set(state.collapsedWidgets);
          if (collapsed.has(widgetId)) {
            collapsed.delete(widgetId);
          } else {
            collapsed.add(widgetId);
          }
          return { collapsedWidgets: Array.from(collapsed) };
        });
        get().saveToDatabase();
      },

      // Toggle widget visibility
      toggleWidgetVisibility: (widgetId) => {
        set((state) => ({
          layout: state.layout.map((widget) =>
            widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
          ),
        }));
        get().saveToDatabase();
      },

      // Add a new widget
      addWidget: (widget) => {
        set((state) => ({
          layout: [...state.layout, { ...widget, position: state.layout.length }],
        }));
        get().saveToDatabase();
      },

      // Remove a widget
      removeWidget: (widgetId) => {
        set((state) => ({
          layout: state.layout
            .filter((w) => w.id !== widgetId)
            .map((widget, idx) => ({ ...widget, position: idx })),
        }));
        get().saveToDatabase();
      },

      // Apply a role preset (local defaults, saved to DB)
      applyPreset: (role) => {
        const defaultLayout = get().getDefaultLayoutForRole(role);
        set({
          layout: defaultLayout,
          collapsedWidgets: [],
          widgetConfigs: {},
        });
        get().saveToDatabase();
      },

      // Reset to default layout (server-side, uses user's actual role)
      resetToDefault: async () => {
        set({ isLoading: true });

        try {
          const result = await resetToDefaultPreferences();

          if (result.success) {
            set({
              layout: result.data.layout,
              collapsedWidgets: result.data.collapsedWidgets,
              widgetConfigs: {},
              isLoading: false,
            });
          } else {
            // Fallback to local defaults
            set({
              layout: DEFAULT_LAYOUTS.developer,
              collapsedWidgets: [],
              widgetConfigs: {},
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Failed to reset preferences:', error);
          set({
            layout: DEFAULT_LAYOUTS.developer,
            collapsedWidgets: [],
            widgetConfigs: {},
            isLoading: false,
          });
        }
      },

      // Set widget configuration
      setWidgetConfig: (widgetId, config) => {
        set((state) => ({
          widgetConfigs: {
            ...state.widgetConfigs,
            [widgetId]: config,
          },
        }));
        // Note: Widget configs could be saved to DB in future
      },

      // Get widget configuration with defaults
      getWidgetConfig: (widgetId: string, widgetType: string): Record<string, unknown> => {
        const state = get();
        const customConfig = state.widgetConfigs[widgetId];
        const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType];
        return { ...defaultConfig, ...customConfig };
      },

      // Get default layout for a role
      getDefaultLayoutForRole: (role) => {
        const roleKey = role.toLowerCase();
        if (roleKey in DEFAULT_LAYOUTS) {
          return DEFAULT_LAYOUTS[roleKey as RoleKey];
        }
        return DEFAULT_LAYOUTS.developer;
      },
    })),
    { name: 'DashboardStore' }
  )
);

// Selector hooks for better performance
export const useEditMode = () => useDashboardStore((state) => state.editMode);
export const useLayout = () => useDashboardStore((state) => state.layout);
export const useCollapsedWidgets = () => useDashboardStore((state) => state.collapsedWidgets);
export const useWidgetConfigs = () => useDashboardStore((state) => state.widgetConfigs);
export const useIsLoading = () => useDashboardStore((state) => state.isLoading);
export const useIsSaving = () => useDashboardStore((state) => state.isSaving);
export const useIsInitialized = () => useDashboardStore((state) => state.isInitialized);

// Hook to get config for a specific widget
export function useWidgetConfig(widgetId: string, widgetType: string): Record<string, unknown> {
  const { getWidgetConfig } = useDashboardStore();
  return getWidgetConfig(widgetId, widgetType);
}

// Initialize hook for use in components
export function useDashboardInit() {
  const { initialize, isInitialized, isLoading } = useDashboardStore();
  const [hasStartedInit, setHasStartedInit] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized && !isLoading && !hasStartedInit) {
      setHasStartedInit(true);
      void initialize();
    }
  }, [isInitialized, isLoading, hasStartedInit, initialize]);

  return { isInitialized, isLoading };
}
