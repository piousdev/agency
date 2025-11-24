'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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

// Role-specific default layouts
const DEFAULT_LAYOUTS: Record<RoleKey, WidgetLayout[]> = {
  admin: [
    { id: 'quick-actions', type: 'quick-actions', size: 'large', position: 0, visible: true },
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 1, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 2, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 3, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 4,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 5, visible: true },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 6,
      visible: true,
    },
  ],
  pm: [
    { id: 'quick-actions', type: 'quick-actions', size: 'large', position: 0, visible: true },
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 1, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 2, visible: true },
    { id: 'my-work-today', type: 'my-work-today', size: 'medium', position: 3, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 4, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 5, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 6,
      visible: true,
    },
  ],
  developer: [
    { id: 'quick-actions', type: 'quick-actions', size: 'large', position: 0, visible: true },
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 1, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 2, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 3, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 4,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 5, visible: true },
  ],
  designer: [
    { id: 'quick-actions', type: 'quick-actions', size: 'large', position: 0, visible: true },
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 1, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
  ],
  qa: [
    { id: 'quick-actions', type: 'quick-actions', size: 'large', position: 0, visible: true },
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 1, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 2, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 3, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 4,
      visible: true,
    },
  ],
  client: [
    { id: 'quick-actions', type: 'quick-actions', size: 'large', position: 0, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 1,
      visible: true,
    },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 2,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 3, visible: true },
  ],
};

interface DashboardState {
  // Layout state
  layout: WidgetLayout[];
  editMode: boolean;
  collapsedWidgets: string[];
  widgetConfigs: Record<string, Record<string, unknown>>;

  // Actions
  setLayout: (layout: WidgetLayout[]) => void;
  reorderWidgets: (oldIndex: number, newIndex: number) => void;
  toggleEditMode: () => void;
  toggleWidgetCollapse: (widgetId: string) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  addWidget: (widget: WidgetLayout) => void;
  removeWidget: (widgetId: string) => void;
  resetToDefault: (role: string) => void;
  setWidgetConfig: (widgetId: string, config: Record<string, unknown>) => void;
  getWidgetConfig: <T extends Record<string, unknown>>(widgetId: string, widgetType: string) => T;

  // Helpers
  getDefaultLayoutForRole: (role: string) => WidgetLayout[];
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        layout: DEFAULT_LAYOUTS.developer, // Default fallback
        editMode: false,
        collapsedWidgets: [],
        widgetConfigs: {},

        // Set entire layout
        setLayout: (layout) => set({ layout }),

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
        },

        // Toggle widget visibility
        toggleWidgetVisibility: (widgetId) => {
          set((state) => ({
            layout: state.layout.map((widget) =>
              widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
            ),
          }));
        },

        // Add a new widget
        addWidget: (widget) => {
          set((state) => ({
            layout: [...state.layout, { ...widget, position: state.layout.length }],
          }));
        },

        // Remove a widget
        removeWidget: (widgetId) => {
          set((state) => ({
            layout: state.layout
              .filter((w) => w.id !== widgetId)
              .map((widget, idx) => ({ ...widget, position: idx })),
          }));
        },

        // Reset to default layout for role
        resetToDefault: (role) => {
          const defaultLayout = get().getDefaultLayoutForRole(role);
          set({ layout: defaultLayout, collapsedWidgets: [], widgetConfigs: {} });
        },

        // Set widget configuration
        setWidgetConfig: (widgetId, config) => {
          set((state) => ({
            widgetConfigs: {
              ...state.widgetConfigs,
              [widgetId]: config,
            },
          }));
        },

        // Get widget configuration with defaults
        getWidgetConfig: <T extends Record<string, unknown>>(
          widgetId: string,
          widgetType: string
        ): T => {
          const state = get();
          const customConfig = state.widgetConfigs[widgetId];
          const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType] || {};
          return { ...defaultConfig, ...customConfig } as T;
        },

        // Get default layout for a role
        getDefaultLayoutForRole: (role) => {
          const roleKey = role.toLowerCase() as RoleKey;
          return DEFAULT_LAYOUTS[roleKey] ?? DEFAULT_LAYOUTS.developer;
        },
      }),
      {
        name: 'dashboard-preferences',
        // Persist layout, collapsed state, and widget configs
        partialize: (state) => ({
          layout: state.layout,
          collapsedWidgets: state.collapsedWidgets,
          widgetConfigs: state.widgetConfigs,
        }),
      }
    ),
    { name: 'DashboardStore' }
  )
);

// Selector hooks for better performance
export const useEditMode = () => useDashboardStore((state) => state.editMode);
export const useLayout = () => useDashboardStore((state) => state.layout);
export const useCollapsedWidgets = () => useDashboardStore((state) => state.collapsedWidgets);
export const useWidgetConfigs = () => useDashboardStore((state) => state.widgetConfigs);

// Hook to get config for a specific widget
export function useWidgetConfig<T extends Record<string, unknown>>(
  widgetId: string,
  widgetType: string
): T {
  const { getWidgetConfig } = useDashboardStore();
  return getWidgetConfig<T>(widgetId, widgetType);
}
