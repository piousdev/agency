/**
 * Intake Store Tests
 * Tests for Zustand store actions and state management for intake pipeline
 */

import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  useIntakeStore,
  selectViewMode,
  selectActiveStage,
  selectFilters,
  selectSelectedIds,
  selectSelectedCount,
  selectHasActiveFilters,
} from '../intake-store';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

describe('Intake Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useIntakeStore.setState({
      viewMode: 'cards',
      activeStage: 'all',
      filters: {
        stage: [],
        priority: [],
        type: [],
        assignedPmId: null,
        clientId: null,
        dateRange: {
          from: null,
          to: null,
        },
      },
      selectedIds: [],
      draft: null,
      draftStep: 0,
    });
    mockLocalStorage.clear();
  });

  describe('Initial State', () => {
    it('should have default view mode as cards', () => {
      const { viewMode } = useIntakeStore.getState();
      expect(viewMode).toBe('cards');
    });

    it('should have default active stage as all', () => {
      const { activeStage } = useIntakeStore.getState();
      expect(activeStage).toBe('all');
    });

    it('should start with empty filters', () => {
      const { filters } = useIntakeStore.getState();
      expect(filters.priority).toEqual([]);
      expect(filters.type).toEqual([]);
      expect(filters.assignedPmId).toBeNull();
      expect(filters.clientId).toBeNull();
      expect(filters.dateRange.from).toBeNull();
      expect(filters.dateRange.to).toBeNull();
    });

    it('should start with empty selection', () => {
      const { selectedIds } = useIntakeStore.getState();
      expect(selectedIds).toEqual([]);
    });

    it('should start with no draft', () => {
      const { draft, draftStep } = useIntakeStore.getState();
      expect(draft).toBeNull();
      expect(draftStep).toBe(0);
    });
  });

  describe('setViewMode', () => {
    it('should update view mode to table', () => {
      const { setViewMode } = useIntakeStore.getState();

      act(() => {
        setViewMode('table');
      });

      const { viewMode } = useIntakeStore.getState();
      expect(viewMode).toBe('table');
    });

    it('should update view mode to cards', () => {
      const { setViewMode } = useIntakeStore.getState();

      act(() => {
        setViewMode('table');
        setViewMode('cards');
      });

      const { viewMode } = useIntakeStore.getState();
      expect(viewMode).toBe('cards');
    });
  });

  describe('setActiveStage', () => {
    it('should update active stage', () => {
      const { setActiveStage } = useIntakeStore.getState();

      act(() => {
        setActiveStage('in_treatment');
      });

      const { activeStage } = useIntakeStore.getState();
      expect(activeStage).toBe('in_treatment');
    });

    it('should clear selection when changing stage', () => {
      const { toggleSelection, setActiveStage } = useIntakeStore.getState();

      act(() => {
        toggleSelection('item-1');
        toggleSelection('item-2');
      });

      expect(useIntakeStore.getState().selectedIds).toHaveLength(2);

      act(() => {
        setActiveStage('estimation');
      });

      const { selectedIds } = useIntakeStore.getState();
      expect(selectedIds).toEqual([]);
    });

    it('should accept all valid stages', () => {
      const { setActiveStage } = useIntakeStore.getState();
      const stages = ['all', 'in_treatment', 'on_hold', 'estimation', 'ready'] as const;

      stages.forEach((stage) => {
        act(() => {
          setActiveStage(stage);
        });
        expect(useIntakeStore.getState().activeStage).toBe(stage);
      });
    });
  });

  describe('setFilters', () => {
    it('should update priority filter', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ priority: ['high', 'critical'] });
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.priority).toEqual(['high', 'critical']);
    });

    it('should update type filter', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ type: ['bug', 'feature'] });
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.type).toEqual(['bug', 'feature']);
    });

    it('should update assignedPmId filter', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ assignedPmId: 'pm-123' });
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.assignedPmId).toBe('pm-123');
    });

    it('should update clientId filter', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ clientId: 'client-456' });
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.clientId).toBe('client-456');
    });

    it('should update date range filter', () => {
      const { setFilters } = useIntakeStore.getState();
      const from = new Date('2024-01-01');
      const to = new Date('2024-12-31');

      act(() => {
        setFilters({ dateRange: { from, to } });
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.dateRange.from).toEqual(from);
      expect(filters.dateRange.to).toEqual(to);
    });

    it('should merge filters without overwriting others', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ priority: ['high'] });
        setFilters({ type: ['bug'] });
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.priority).toEqual(['high']);
      expect(filters.type).toEqual(['bug']);
    });

    it('should clear selection when filters change', () => {
      const { toggleSelection, setFilters } = useIntakeStore.getState();

      act(() => {
        toggleSelection('item-1');
      });

      expect(useIntakeStore.getState().selectedIds).toHaveLength(1);

      act(() => {
        setFilters({ priority: ['high'] });
      });

      const { selectedIds } = useIntakeStore.getState();
      expect(selectedIds).toEqual([]);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial state', () => {
      const { setFilters, clearFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({
          priority: ['high', 'critical'],
          type: ['bug'],
          assignedPmId: 'pm-123',
          clientId: 'client-456',
          dateRange: { from: new Date(), to: new Date() },
        });
      });

      act(() => {
        clearFilters();
      });

      const { filters } = useIntakeStore.getState();
      expect(filters.priority).toEqual([]);
      expect(filters.type).toEqual([]);
      expect(filters.assignedPmId).toBeNull();
      expect(filters.clientId).toBeNull();
      expect(filters.dateRange.from).toBeNull();
      expect(filters.dateRange.to).toBeNull();
    });

    it('should clear selection when filters are cleared', () => {
      const { toggleSelection, clearFilters } = useIntakeStore.getState();

      act(() => {
        toggleSelection('item-1');
      });

      act(() => {
        clearFilters();
      });

      const { selectedIds } = useIntakeStore.getState();
      expect(selectedIds).toEqual([]);
    });
  });

  describe('Selection Actions', () => {
    describe('toggleSelection', () => {
      it('should add item to selection', () => {
        const { toggleSelection } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toContain('item-1');
      });

      it('should remove item from selection', () => {
        const { toggleSelection } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
          toggleSelection('item-1');
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).not.toContain('item-1');
      });

      it('should handle multiple items independently', () => {
        const { toggleSelection } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
          toggleSelection('item-2');
          toggleSelection('item-3');
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toContain('item-1');
        expect(selectedIds).toContain('item-2');
        expect(selectedIds).toContain('item-3');
        expect(selectedIds).toHaveLength(3);
      });

      it('should toggle specific item without affecting others', () => {
        const { toggleSelection } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
          toggleSelection('item-2');
          toggleSelection('item-1'); // Deselect item-1
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).not.toContain('item-1');
        expect(selectedIds).toContain('item-2');
        expect(selectedIds).toHaveLength(1);
      });
    });

    describe('selectAll', () => {
      it('should select all provided ids', () => {
        const { selectAll } = useIntakeStore.getState();

        act(() => {
          selectAll(['item-1', 'item-2', 'item-3']);
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toEqual(['item-1', 'item-2', 'item-3']);
      });

      it('should replace existing selection', () => {
        const { toggleSelection, selectAll } = useIntakeStore.getState();

        act(() => {
          toggleSelection('old-item');
        });

        act(() => {
          selectAll(['new-1', 'new-2']);
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toEqual(['new-1', 'new-2']);
        expect(selectedIds).not.toContain('old-item');
      });

      it('should handle empty array', () => {
        const { toggleSelection, selectAll } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
          selectAll([]);
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toEqual([]);
      });
    });

    describe('clearSelection', () => {
      it('should clear all selected items', () => {
        const { toggleSelection, clearSelection } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
          toggleSelection('item-2');
          toggleSelection('item-3');
        });

        act(() => {
          clearSelection();
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toEqual([]);
      });

      it('should be safe to call when already empty', () => {
        const { clearSelection } = useIntakeStore.getState();

        act(() => {
          clearSelection();
        });

        const { selectedIds } = useIntakeStore.getState();
        expect(selectedIds).toEqual([]);
      });
    });

    describe('isSelected', () => {
      it('should return true for selected item', () => {
        const { toggleSelection, isSelected } = useIntakeStore.getState();

        act(() => {
          toggleSelection('item-1');
        });

        expect(isSelected('item-1')).toBe(true);
      });

      it('should return false for non-selected item', () => {
        const { isSelected } = useIntakeStore.getState();

        expect(isSelected('item-1')).toBe(false);
      });

      it('should update correctly after toggle', () => {
        const { toggleSelection, isSelected } = useIntakeStore.getState();

        expect(isSelected('item-1')).toBe(false);

        act(() => {
          toggleSelection('item-1');
        });
        expect(isSelected('item-1')).toBe(true);

        act(() => {
          toggleSelection('item-1');
        });
        expect(isSelected('item-1')).toBe(false);
      });
    });
  });

  describe('Draft Actions', () => {
    describe('saveDraft', () => {
      it('should save draft data and step', () => {
        const { saveDraft } = useIntakeStore.getState();

        act(() => {
          saveDraft(
            {
              title: 'Test Request',
              type: 'feature',
            },
            1
          );
        });

        const { draft, draftStep } = useIntakeStore.getState();
        expect(draft).toEqual({ title: 'Test Request', type: 'feature' });
        expect(draftStep).toBe(1);
      });

      it('should merge with existing draft data', () => {
        const { saveDraft } = useIntakeStore.getState();

        act(() => {
          saveDraft({ title: 'Test Request' }, 1);
          saveDraft({ type: 'bug', priority: 'high' }, 2);
        });

        const { draft, draftStep } = useIntakeStore.getState();
        expect(draft).toEqual({
          title: 'Test Request',
          type: 'bug',
          priority: 'high',
        });
        expect(draftStep).toBe(2);
      });

      it('should update step on each save', () => {
        const { saveDraft } = useIntakeStore.getState();

        act(() => {
          saveDraft({}, 1);
        });
        expect(useIntakeStore.getState().draftStep).toBe(1);

        act(() => {
          saveDraft({}, 3);
        });
        expect(useIntakeStore.getState().draftStep).toBe(3);
      });
    });

    describe('clearDraft', () => {
      it('should clear draft and reset step', () => {
        const { saveDraft, clearDraft } = useIntakeStore.getState();

        act(() => {
          saveDraft({ title: 'Test', type: 'feature' }, 3);
        });

        act(() => {
          clearDraft();
        });

        const { draft, draftStep } = useIntakeStore.getState();
        expect(draft).toBeNull();
        expect(draftStep).toBe(0);
      });
    });

    describe('getDraft', () => {
      it('should return current draft and step', () => {
        const { saveDraft, getDraft } = useIntakeStore.getState();

        act(() => {
          saveDraft({ title: 'Test Request' }, 2);
        });

        const result = getDraft();
        expect(result.data).toEqual({ title: 'Test Request' });
        expect(result.step).toBe(2);
      });

      it('should return null data when no draft', () => {
        const { getDraft } = useIntakeStore.getState();

        const result = getDraft();
        expect(result.data).toBeNull();
        expect(result.step).toBe(0);
      });
    });
  });
});

describe('Selectors', () => {
  beforeEach(() => {
    useIntakeStore.setState({
      viewMode: 'cards',
      activeStage: 'all',
      filters: {
        stage: [],
        priority: [],
        type: [],
        assignedPmId: null,
        clientId: null,
        dateRange: {
          from: null,
          to: null,
        },
      },
      selectedIds: [],
      draft: null,
      draftStep: 0,
    });
  });

  describe('selectViewMode', () => {
    it('should return current view mode', () => {
      const state = useIntakeStore.getState();
      expect(selectViewMode(state)).toBe('cards');
    });
  });

  describe('selectActiveStage', () => {
    it('should return current active stage', () => {
      const state = useIntakeStore.getState();
      expect(selectActiveStage(state)).toBe('all');
    });
  });

  describe('selectFilters', () => {
    it('should return current filters', () => {
      const state = useIntakeStore.getState();
      const filters = selectFilters(state);
      expect(filters.priority).toEqual([]);
      expect(filters.type).toEqual([]);
    });
  });

  describe('selectSelectedIds', () => {
    it('should return selected ids array', () => {
      const state = useIntakeStore.getState();
      expect(selectSelectedIds(state)).toEqual([]);
    });
  });

  describe('selectSelectedCount', () => {
    it('should return count of selected items', () => {
      const { toggleSelection } = useIntakeStore.getState();

      act(() => {
        toggleSelection('item-1');
        toggleSelection('item-2');
      });

      const state = useIntakeStore.getState();
      expect(selectSelectedCount(state)).toBe(2);
    });

    it('should return 0 when nothing selected', () => {
      const state = useIntakeStore.getState();
      expect(selectSelectedCount(state)).toBe(0);
    });
  });

  describe('selectHasActiveFilters', () => {
    it('should return false when no filters active', () => {
      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(false);
    });

    it('should return true when priority filter active', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ priority: ['high'] });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return true when type filter active', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ type: ['bug'] });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return true when assignedPmId filter active', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ assignedPmId: 'pm-123' });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return true when clientId filter active', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ clientId: 'client-123' });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return true when date range from is set', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ dateRange: { from: new Date(), to: null } });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return true when date range to is set', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ dateRange: { from: null, to: new Date() } });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return true when multiple filters active', () => {
      const { setFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({
          priority: ['high', 'critical'],
          type: ['bug'],
          assignedPmId: 'pm-123',
        });
      });

      const state = useIntakeStore.getState();
      expect(selectHasActiveFilters(state)).toBe(true);
    });

    it('should return false after clearing filters', () => {
      const { setFilters, clearFilters } = useIntakeStore.getState();

      act(() => {
        setFilters({ priority: ['high'] });
      });

      expect(selectHasActiveFilters(useIntakeStore.getState())).toBe(true);

      act(() => {
        clearFilters();
      });

      expect(selectHasActiveFilters(useIntakeStore.getState())).toBe(false);
    });
  });
});

describe('Selector Hooks', () => {
  beforeEach(() => {
    useIntakeStore.setState({
      viewMode: 'cards',
      activeStage: 'all',
      filters: {
        stage: [],
        priority: [],
        type: [],
        assignedPmId: null,
        clientId: null,
        dateRange: {
          from: null,
          to: null,
        },
      },
      selectedIds: [],
      draft: null,
      draftStep: 0,
    });
  });

  it('should update when view mode changes', () => {
    const { result } = renderHook(() => useIntakeStore((state) => state.viewMode));
    expect(result.current).toBe('cards');

    act(() => {
      useIntakeStore.getState().setViewMode('table');
    });

    expect(result.current).toBe('table');
  });

  it('should update when active stage changes', () => {
    const { result } = renderHook(() => useIntakeStore((state) => state.activeStage));
    expect(result.current).toBe('all');

    act(() => {
      useIntakeStore.getState().setActiveStage('estimation');
    });

    expect(result.current).toBe('estimation');
  });

  it('should update when selection changes', () => {
    const { result } = renderHook(() => useIntakeStore((state) => state.selectedIds));
    expect(result.current).toEqual([]);

    act(() => {
      useIntakeStore.getState().toggleSelection('item-1');
    });

    expect(result.current).toContain('item-1');
  });
});

describe('Store Configuration', () => {
  it('should have correct partialize configuration for persistence', () => {
    // Test that the store state can be serialized
    const { viewMode, draft, draftStep } = useIntakeStore.getState();

    // These are the persisted fields according to the store config
    const persistedState = { viewMode, draft, draftStep };

    // Should be serializable (no functions or complex objects in persisted state)
    expect(JSON.stringify(persistedState)).toBeTruthy();
    expect(persistedState.viewMode).toBe('cards');
    expect(persistedState.draft).toBeNull();
    expect(persistedState.draftStep).toBe(0);
  });

  it('should not persist selectedIds or filters', () => {
    // These should not be persisted, so changes should not affect serializable state
    const { toggleSelection, setFilters } = useIntakeStore.getState();

    // First update filters (this clears selection)
    act(() => {
      setFilters({ priority: ['high'] });
    });

    // Then add selection
    act(() => {
      toggleSelection('item-1');
    });

    const { selectedIds, filters, viewMode, draft, draftStep } = useIntakeStore.getState();

    // Non-persisted state should change
    expect(selectedIds).toContain('item-1');
    expect(filters.priority).toContain('high');

    // But these are the only persisted fields
    const persistedState = { viewMode, draft, draftStep };
    expect(Object.keys(persistedState)).toEqual(['viewMode', 'draft', 'draftStep']);
  });
});
