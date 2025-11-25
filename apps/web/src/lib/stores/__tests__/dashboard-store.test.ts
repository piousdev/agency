/**
 * Dashboard Store Tests
 * Tests for Zustand store actions and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useDashboardStore,
  useEditMode,
  useLayout,
  useCollapsedWidgets,
  useWidgetConfigs,
  useWidgetConfig,
  DEFAULT_WIDGET_CONFIGS,
  type WidgetLayout,
  type WidgetSize,
} from '../dashboard-store';

// Mock the server actions
vi.mock('@/lib/actions/business-center/dashboard-preferences', () => ({
  fetchDashboardPreferences: vi.fn().mockResolvedValue({ success: false }),
  saveDashboardPreferences: vi.fn().mockResolvedValue({ success: true }),
  resetToDefaultPreferences: vi.fn().mockResolvedValue({ success: false }),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Dashboard Store', () => {
  beforeEach(async () => {
    // Fully reset store state before each test
    useDashboardStore.setState({
      layout: [],
      editMode: false,
      collapsedWidgets: [],
      widgetConfigs: {},
    });
    // Then apply default layout (now async)
    const { resetToDefault } = useDashboardStore.getState();
    await resetToDefault('developer');
    mockLocalStorage.clear();
  });

  describe('Initial State', () => {
    it('should have default layout for developer role', () => {
      const { layout } = useDashboardStore.getState();

      expect(layout).toBeDefined();
      expect(Array.isArray(layout)).toBe(true);
      expect(layout.length).toBeGreaterThan(0);
    });

    it('should start with editMode disabled', () => {
      const { editMode } = useDashboardStore.getState();
      expect(editMode).toBe(false);
    });

    it('should start with empty collapsedWidgets', () => {
      const { collapsedWidgets } = useDashboardStore.getState();
      expect(collapsedWidgets).toEqual([]);
    });

    it('should start with empty widgetConfigs', () => {
      const { widgetConfigs } = useDashboardStore.getState();
      expect(widgetConfigs).toEqual({});
    });
  });

  describe('setLayout', () => {
    it('should update the layout', () => {
      const { setLayout } = useDashboardStore.getState();
      const newLayout: WidgetLayout[] = [
        { id: 'test-1', type: 'organization-health', size: 'large', position: 0, visible: true },
        { id: 'test-2', type: 'my-work-today', size: 'medium', position: 1, visible: true },
      ];

      act(() => {
        setLayout(newLayout);
      });

      const { layout } = useDashboardStore.getState();
      expect(layout).toEqual(newLayout);
    });

    it('should replace entire layout', () => {
      const { setLayout } = useDashboardStore.getState();
      const originalLayout = useDashboardStore.getState().layout;

      const newLayout: WidgetLayout[] = [
        { id: 'single', type: 'blockers', size: 'small', position: 0, visible: true },
      ];

      act(() => {
        setLayout(newLayout);
      });

      const { layout } = useDashboardStore.getState();
      expect(layout).toHaveLength(1);
      expect(layout).not.toEqual(originalLayout);
    });
  });

  describe('reorderWidgets', () => {
    it('should move widget from one position to another', () => {
      const { setLayout, reorderWidgets } = useDashboardStore.getState();
      const initialLayout: WidgetLayout[] = [
        { id: 'a', type: 'organization-health', size: 'large', position: 0, visible: true },
        { id: 'b', type: 'my-work-today', size: 'medium', position: 1, visible: true },
        { id: 'c', type: 'blockers', size: 'small', position: 2, visible: true },
      ];

      act(() => {
        setLayout(initialLayout);
      });

      act(() => {
        reorderWidgets(2, 0); // Move 'c' from index 2 to index 0
      });

      const { layout } = useDashboardStore.getState();
      expect(layout[0].id).toBe('c');
      expect(layout[1].id).toBe('a');
      expect(layout[2].id).toBe('b');
    });

    it('should update position values after reorder', () => {
      const { setLayout, reorderWidgets } = useDashboardStore.getState();
      const initialLayout: WidgetLayout[] = [
        { id: 'a', type: 'organization-health', size: 'large', position: 0, visible: true },
        { id: 'b', type: 'my-work-today', size: 'medium', position: 1, visible: true },
        { id: 'c', type: 'blockers', size: 'small', position: 2, visible: true },
      ];

      act(() => {
        setLayout(initialLayout);
      });

      act(() => {
        reorderWidgets(0, 2);
      });

      const { layout } = useDashboardStore.getState();
      expect(layout[0].position).toBe(0);
      expect(layout[1].position).toBe(1);
      expect(layout[2].position).toBe(2);
    });

    it('should handle same index reorder (no change)', () => {
      const { setLayout, reorderWidgets } = useDashboardStore.getState();
      const initialLayout: WidgetLayout[] = [
        { id: 'a', type: 'organization-health', size: 'large', position: 0, visible: true },
        { id: 'b', type: 'my-work-today', size: 'medium', position: 1, visible: true },
      ];

      act(() => {
        setLayout(initialLayout);
      });

      act(() => {
        reorderWidgets(0, 0);
      });

      const { layout } = useDashboardStore.getState();
      expect(layout[0].id).toBe('a');
      expect(layout[1].id).toBe('b');
    });
  });

  describe('toggleEditMode', () => {
    it('should toggle edit mode on', () => {
      const { toggleEditMode } = useDashboardStore.getState();

      act(() => {
        toggleEditMode();
      });

      const { editMode } = useDashboardStore.getState();
      expect(editMode).toBe(true);
    });

    it('should toggle edit mode off', () => {
      const { toggleEditMode } = useDashboardStore.getState();

      act(() => {
        toggleEditMode();
        toggleEditMode();
      });

      const { editMode } = useDashboardStore.getState();
      expect(editMode).toBe(false);
    });
  });

  describe('toggleWidgetCollapse', () => {
    it('should collapse a widget', () => {
      const { toggleWidgetCollapse } = useDashboardStore.getState();

      act(() => {
        toggleWidgetCollapse('test-widget');
      });

      const { collapsedWidgets } = useDashboardStore.getState();
      expect(collapsedWidgets).toContain('test-widget');
    });

    it('should expand a collapsed widget', () => {
      const { toggleWidgetCollapse } = useDashboardStore.getState();

      act(() => {
        toggleWidgetCollapse('test-widget');
        toggleWidgetCollapse('test-widget');
      });

      const { collapsedWidgets } = useDashboardStore.getState();
      expect(collapsedWidgets).not.toContain('test-widget');
    });

    it('should handle multiple widgets independently', () => {
      const { toggleWidgetCollapse } = useDashboardStore.getState();

      act(() => {
        toggleWidgetCollapse('widget-1');
        toggleWidgetCollapse('widget-2');
      });

      const { collapsedWidgets } = useDashboardStore.getState();
      expect(collapsedWidgets).toContain('widget-1');
      expect(collapsedWidgets).toContain('widget-2');
      expect(collapsedWidgets).toHaveLength(2);
    });
  });

  describe('toggleWidgetVisibility', () => {
    it('should hide a visible widget', () => {
      const { setLayout, toggleWidgetVisibility } = useDashboardStore.getState();
      const layout: WidgetLayout[] = [
        { id: 'test', type: 'organization-health', size: 'large', position: 0, visible: true },
      ];

      act(() => {
        setLayout(layout);
        toggleWidgetVisibility('test');
      });

      const { layout: updatedLayout } = useDashboardStore.getState();
      expect(updatedLayout[0].visible).toBe(false);
    });

    it('should show a hidden widget', () => {
      const { setLayout, toggleWidgetVisibility } = useDashboardStore.getState();
      const layout: WidgetLayout[] = [
        { id: 'test', type: 'organization-health', size: 'large', position: 0, visible: false },
      ];

      act(() => {
        setLayout(layout);
        toggleWidgetVisibility('test');
      });

      const { layout: updatedLayout } = useDashboardStore.getState();
      expect(updatedLayout[0].visible).toBe(true);
    });
  });

  describe('addWidget', () => {
    it('should add a new widget to the layout', () => {
      const { setLayout, addWidget } = useDashboardStore.getState();

      act(() => {
        setLayout([]);
      });

      const newWidget: WidgetLayout = {
        id: 'new-widget',
        type: 'blockers',
        size: 'medium',
        position: 0,
        visible: true,
      };

      act(() => {
        addWidget(newWidget);
      });

      const { layout } = useDashboardStore.getState();
      expect(layout).toHaveLength(1);
      expect(layout[0].id).toBe('new-widget');
    });

    it('should update position to end of layout', () => {
      const { setLayout, addWidget } = useDashboardStore.getState();
      const initialLayout: WidgetLayout[] = [
        { id: 'existing', type: 'organization-health', size: 'large', position: 0, visible: true },
      ];

      act(() => {
        setLayout(initialLayout);
      });

      const newWidget: WidgetLayout = {
        id: 'new-widget',
        type: 'blockers',
        size: 'medium',
        position: 999, // This should be overwritten
        visible: true,
      };

      act(() => {
        addWidget(newWidget);
      });

      const { layout } = useDashboardStore.getState();
      expect(layout[1].position).toBe(1);
    });
  });

  describe('removeWidget', () => {
    it('should remove a widget from the layout', () => {
      const { setLayout, removeWidget } = useDashboardStore.getState();
      const layout: WidgetLayout[] = [
        { id: 'keep', type: 'organization-health', size: 'large', position: 0, visible: true },
        { id: 'remove', type: 'blockers', size: 'medium', position: 1, visible: true },
      ];

      act(() => {
        setLayout(layout);
        removeWidget('remove');
      });

      const { layout: updatedLayout } = useDashboardStore.getState();
      expect(updatedLayout).toHaveLength(1);
      expect(updatedLayout[0].id).toBe('keep');
    });

    it('should update positions after removal', () => {
      const { setLayout, removeWidget } = useDashboardStore.getState();
      const layout: WidgetLayout[] = [
        { id: 'a', type: 'organization-health', size: 'large', position: 0, visible: true },
        { id: 'b', type: 'blockers', size: 'medium', position: 1, visible: true },
        { id: 'c', type: 'my-work-today', size: 'small', position: 2, visible: true },
      ];

      act(() => {
        setLayout(layout);
        removeWidget('a');
      });

      const { layout: updatedLayout } = useDashboardStore.getState();
      expect(updatedLayout[0].position).toBe(0);
      expect(updatedLayout[1].position).toBe(1);
    });
  });

  describe('resetToDefault', () => {
    it('should reset to admin layout via getDefaultLayoutForRole', () => {
      const { getDefaultLayoutForRole, setLayout } = useDashboardStore.getState();

      act(() => {
        setLayout(getDefaultLayoutForRole('admin'));
      });

      const { layout } = useDashboardStore.getState();
      // Admin layout should have organization-health, critical-alerts, team-status
      expect(layout.some((w) => w.type === 'organization-health')).toBe(true);
      expect(layout.some((w) => w.type === 'critical-alerts')).toBe(true);
    });

    it('should reset to developer layout', async () => {
      const { resetToDefault } = useDashboardStore.getState();

      await act(async () => {
        await resetToDefault();
      });

      const { layout } = useDashboardStore.getState();
      // Developer layout should have my-work-today, current-sprint, blockers (fallback when server fails)
      expect(layout.some((w) => w.type === 'my-work-today')).toBe(true);
      expect(layout.some((w) => w.type === 'blockers')).toBe(true);
    });

    it('should reset to client layout via getDefaultLayoutForRole', () => {
      const { getDefaultLayoutForRole, setLayout } = useDashboardStore.getState();

      act(() => {
        setLayout(getDefaultLayoutForRole('client'));
      });

      const { layout } = useDashboardStore.getState();
      // Client layout should have financial-snapshot and be limited
      expect(layout.some((w) => w.type === 'financial-snapshot')).toBe(true);
      expect(layout.some((w) => w.type === 'organization-health')).toBe(false);
    });

    it('should clear collapsedWidgets on reset', async () => {
      const { toggleWidgetCollapse, resetToDefault } = useDashboardStore.getState();

      act(() => {
        toggleWidgetCollapse('some-widget');
      });

      await act(async () => {
        await resetToDefault();
      });

      const { collapsedWidgets } = useDashboardStore.getState();
      expect(collapsedWidgets).toEqual([]);
    });

    it('should clear widgetConfigs on reset', async () => {
      const { setWidgetConfig, resetToDefault } = useDashboardStore.getState();

      act(() => {
        setWidgetConfig('some-widget', { test: true });
      });

      await act(async () => {
        await resetToDefault();
      });

      const { widgetConfigs } = useDashboardStore.getState();
      expect(widgetConfigs).toEqual({});
    });

    it('should fallback to developer layout when server fails', async () => {
      const { resetToDefault } = useDashboardStore.getState();

      await act(async () => {
        await resetToDefault();
      });

      const { layout } = useDashboardStore.getState();
      // Should get developer layout as fallback when server returns failure
      expect(layout.some((w) => w.type === 'my-work-today')).toBe(true);
    });
  });

  describe('Widget Configuration', () => {
    describe('setWidgetConfig', () => {
      it('should set config for a widget', () => {
        const { setWidgetConfig } = useDashboardStore.getState();

        act(() => {
          setWidgetConfig('my-work-widget', { showCompleted: true, maxItems: 20 });
        });

        const { widgetConfigs } = useDashboardStore.getState();
        expect(widgetConfigs['my-work-widget']).toEqual({
          showCompleted: true,
          maxItems: 20,
        });
      });

      it('should update existing config', () => {
        const { setWidgetConfig } = useDashboardStore.getState();

        act(() => {
          setWidgetConfig('test-widget', { a: 1, b: 2 });
          setWidgetConfig('test-widget', { a: 10, c: 3 });
        });

        const { widgetConfigs } = useDashboardStore.getState();
        expect(widgetConfigs['test-widget']).toEqual({ a: 10, c: 3 });
      });
    });

    describe('getWidgetConfig', () => {
      it('should return merged config with defaults', () => {
        const { setWidgetConfig, getWidgetConfig } = useDashboardStore.getState();

        act(() => {
          setWidgetConfig('my-work-today', { showCompleted: true });
        });

        const config = getWidgetConfig('my-work-today', 'my-work-today');

        // Should have custom value
        expect(config.showCompleted).toBe(true);
        // Should have default values
        expect(config.priorityFilter).toBe('all');
        expect(config.maxItems).toBe(10);
      });

      it('should return defaults when no custom config exists', () => {
        const { getWidgetConfig } = useDashboardStore.getState();

        const config = getWidgetConfig('new-widget', 'my-work-today');

        expect(config).toEqual(DEFAULT_WIDGET_CONFIGS['my-work-today']);
      });

      it('should return empty object for unknown widget type', () => {
        const { getWidgetConfig } = useDashboardStore.getState();

        const config = getWidgetConfig('unknown', 'unknown-type');

        expect(config).toEqual({});
      });
    });
  });

  describe('getDefaultLayoutForRole', () => {
    it('should return admin layout for admin role', () => {
      const { getDefaultLayoutForRole } = useDashboardStore.getState();
      const layout = getDefaultLayoutForRole('admin');

      expect(layout.some((w) => w.type === 'organization-health')).toBe(true);
      expect(layout.some((w) => w.type === 'critical-alerts')).toBe(true);
      expect(layout.some((w) => w.type === 'team-status')).toBe(true);
    });

    it('should return pm layout for pm role', () => {
      const { getDefaultLayoutForRole } = useDashboardStore.getState();
      const layout = getDefaultLayoutForRole('pm');

      expect(layout.some((w) => w.type === 'organization-health')).toBe(true);
      expect(layout.some((w) => w.type === 'team-status')).toBe(true);
      expect(layout.some((w) => w.type === 'current-sprint')).toBe(true);
    });

    it('should handle case-insensitive role names', () => {
      const { getDefaultLayoutForRole } = useDashboardStore.getState();
      const lowerLayout = getDefaultLayoutForRole('admin');
      const upperLayout = getDefaultLayoutForRole('ADMIN');

      expect(lowerLayout.length).toBe(upperLayout.length);
    });

    it('should return developer layout for unknown roles', () => {
      const { getDefaultLayoutForRole } = useDashboardStore.getState();
      const layout = getDefaultLayoutForRole('some-unknown-role');

      // Should get developer layout as fallback
      expect(layout.some((w) => w.type === 'my-work-today')).toBe(true);
      expect(layout.some((w) => w.type === 'blockers')).toBe(true);
    });
  });
});

describe('Selector Hooks', () => {
  beforeEach(async () => {
    // Fully reset store state before each test
    useDashboardStore.setState({
      layout: [],
      editMode: false,
      collapsedWidgets: [],
      widgetConfigs: {},
    });
    const { resetToDefault } = useDashboardStore.getState();
    await resetToDefault('developer');
  });

  describe('useEditMode', () => {
    it('should return current edit mode state', () => {
      const { result } = renderHook(() => useEditMode());
      expect(result.current).toBe(false);
    });

    it('should update when edit mode changes', () => {
      const { result } = renderHook(() => useEditMode());

      act(() => {
        useDashboardStore.getState().toggleEditMode();
      });

      expect(result.current).toBe(true);
    });
  });

  describe('useLayout', () => {
    it('should return current layout', () => {
      const { result } = renderHook(() => useLayout());
      expect(Array.isArray(result.current)).toBe(true);
    });
  });

  describe('useCollapsedWidgets', () => {
    it('should return collapsed widgets array', () => {
      const { result } = renderHook(() => useCollapsedWidgets());
      expect(result.current).toEqual([]);
    });

    it('should update when widgets are collapsed', () => {
      const { result } = renderHook(() => useCollapsedWidgets());

      act(() => {
        useDashboardStore.getState().toggleWidgetCollapse('test');
      });

      expect(result.current).toContain('test');
    });
  });

  describe('useWidgetConfigs', () => {
    it('should return widget configs object', () => {
      const { result } = renderHook(() => useWidgetConfigs());
      expect(result.current).toEqual({});
    });
  });

  describe('useWidgetConfig', () => {
    it('should return config for specific widget', () => {
      const { result } = renderHook(() =>
        useWidgetConfig<{ showCompleted: boolean; priorityFilter: string; maxItems: number }>(
          'my-work',
          'my-work-today'
        )
      );

      expect(result.current.showCompleted).toBe(false);
      expect(result.current.priorityFilter).toBe('all');
      expect(result.current.maxItems).toBe(10);
    });
  });
});

describe('Role-Based Widget Visibility (10.2.4)', () => {
  it('should show admin-specific widgets only for admin role', () => {
    const { getDefaultLayoutForRole } = useDashboardStore.getState();

    const adminLayout = getDefaultLayoutForRole('admin');
    const developerLayout = getDefaultLayoutForRole('developer');

    // Admin should see team-status
    expect(adminLayout.some((w) => w.type === 'team-status')).toBe(true);

    // Developer should NOT see team-status
    expect(developerLayout.some((w) => w.type === 'team-status')).toBe(false);
  });

  it('should show client-specific layout for client role', () => {
    const { getDefaultLayoutForRole } = useDashboardStore.getState();

    const clientLayout = getDefaultLayoutForRole('client');

    // Client should see financial-snapshot
    expect(clientLayout.some((w) => w.type === 'financial-snapshot')).toBe(true);

    // Client should NOT see admin/PM widgets
    expect(clientLayout.some((w) => w.type === 'organization-health')).toBe(false);
    expect(clientLayout.some((w) => w.type === 'team-status')).toBe(false);
    expect(clientLayout.some((w) => w.type === 'critical-alerts')).toBe(false);
  });

  it('should show developer/QA specific widgets for those roles', () => {
    const { getDefaultLayoutForRole } = useDashboardStore.getState();

    const developerLayout = getDefaultLayoutForRole('developer');
    const qaLayout = getDefaultLayoutForRole('qa');

    // Both should have blockers widget
    expect(developerLayout.some((w) => w.type === 'blockers')).toBe(true);
    expect(qaLayout.some((w) => w.type === 'blockers')).toBe(true);

    // Both should have current-sprint
    expect(developerLayout.some((w) => w.type === 'current-sprint')).toBe(true);
    expect(qaLayout.some((w) => w.type === 'current-sprint')).toBe(true);
  });

  it('should have all widgets visible by default in each role layout', () => {
    const roles = ['admin', 'pm', 'developer', 'designer', 'qa', 'client'];
    const { getDefaultLayoutForRole } = useDashboardStore.getState();

    roles.forEach((role) => {
      const layout = getDefaultLayoutForRole(role);
      layout.forEach((widget) => {
        expect(widget.visible).toBe(true);
      });
    });
  });
});
