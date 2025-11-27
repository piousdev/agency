'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

import type {
  RequestStage,
  RequestType,
  Priority,
  CreateRequestInput,
} from '@/lib/schemas/request';

// View mode options
export type ViewMode = 'cards' | 'table' | 'kanban';

// Filter state
export interface IntakeFilters {
  stage: RequestStage[];
  priority: Priority[];
  type: RequestType[];
  assignedPmId: string | null;
  clientId: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Initial filter state
const initialFilters: IntakeFilters = {
  stage: [],
  priority: [],
  type: [],
  assignedPmId: null,
  clientId: null,
  dateRange: {
    from: null,
    to: null,
  },
};

interface IntakeState {
  // View state
  viewMode: ViewMode;
  activeStage: RequestStage | 'all';

  // Filters
  filters: IntakeFilters;

  // Selection (for bulk ops)
  selectedIds: string[];

  // Draft persistence for multi-step form
  draft: Partial<CreateRequestInput> | null;
  draftStep: number;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setActiveStage: (stage: RequestStage | 'all') => void;
  setFilters: (filters: Partial<IntakeFilters>) => void;
  clearFilters: () => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  saveDraft: (data: Partial<CreateRequestInput>, step: number) => void;
  clearDraft: () => void;
  getDraft: () => { data: Partial<CreateRequestInput> | null; step: number };
}

export const useIntakeStore = create<IntakeState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        viewMode: 'cards',
        activeStage: 'all',
        filters: initialFilters,
        selectedIds: [],
        draft: null,
        draftStep: 0,

        // View actions
        setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),

        setActiveStage: (stage) =>
          set({ activeStage: stage, selectedIds: [] }, false, 'setActiveStage'),

        // Filter actions
        setFilters: (newFilters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...newFilters },
              selectedIds: [], // Clear selection when filters change
            }),
            false,
            'setFilters'
          ),

        clearFilters: () =>
          set({ filters: initialFilters, selectedIds: [] }, false, 'clearFilters'),

        // Selection actions
        toggleSelection: (id) =>
          set(
            (state) => ({
              selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter((selectedId) => selectedId !== id)
                : [...state.selectedIds, id],
            }),
            false,
            'toggleSelection'
          ),

        selectAll: (ids) => set({ selectedIds: ids }, false, 'selectAll'),

        clearSelection: () => set({ selectedIds: [] }, false, 'clearSelection'),

        isSelected: (id) => get().selectedIds.includes(id),

        // Draft actions
        saveDraft: (data, step) =>
          set(
            (state) => ({
              draft: { ...state.draft, ...data },
              draftStep: step,
            }),
            false,
            'saveDraft'
          ),

        clearDraft: () => set({ draft: null, draftStep: 0 }, false, 'clearDraft'),

        getDraft: () => ({
          data: get().draft,
          step: get().draftStep,
        }),
      }),
      {
        name: 'intake-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          draft: state.draft,
          draftStep: state.draftStep,
        }),
      }
    ),
    { name: 'IntakeStore' }
  )
);

// Selectors
export const selectViewMode = (state: IntakeState) => state.viewMode;
export const selectActiveStage = (state: IntakeState) => state.activeStage;
export const selectFilters = (state: IntakeState) => state.filters;
export const selectSelectedIds = (state: IntakeState) => state.selectedIds;
export const selectSelectedCount = (state: IntakeState) => state.selectedIds.length;
export const selectHasActiveFilters = (state: IntakeState) => {
  const { filters } = state;
  return (
    filters.stage.length > 0 ||
    filters.priority.length > 0 ||
    filters.type.length > 0 ||
    filters.assignedPmId !== null ||
    filters.clientId !== null ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null
  );
};
