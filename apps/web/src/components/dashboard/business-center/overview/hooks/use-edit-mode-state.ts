import { useMemo, useCallback } from 'react';
import { useEditMode, useLayout, useDashboardStore } from '@/lib/stores/dashboard-store';
import {
  getHiddenWidgets,
  areLayoutsEqual,
} from '@/components/dashboard/business-center/overview/utils/layout';
import type {
  WidgetLayout,
  LayoutPreset,
} from '@/components/dashboard/business-center/overview/types';

interface UseEditModeStateReturn {
  readonly editMode: boolean;
  readonly layout: readonly WidgetLayout[];
  readonly hiddenWidgets: readonly WidgetLayout[];
  readonly hiddenCount: number;
  readonly hasHiddenWidgets: boolean;
  readonly toggleEditMode: () => void;
  readonly resetToDefault: () => void;
  readonly applyPreset: (preset: LayoutPreset) => void;
  readonly toggleWidgetVisibility: (widgetId: string) => void;
  readonly isCurrentPreset: (preset: LayoutPreset) => boolean;
}

export function useEditModeState(): UseEditModeStateReturn {
  const editMode = useEditMode();
  const layout = useLayout();
  const store = useDashboardStore();

  const hiddenWidgets = useMemo(() => getHiddenWidgets(layout), [layout]);

  const isCurrentPreset = useCallback(
    (preset: LayoutPreset): boolean => {
      const presetLayout = store.getDefaultLayoutForRole(preset);
      return areLayoutsEqual(layout, presetLayout);
    },
    [layout, store]
  );

  return {
    editMode,
    layout,
    hiddenWidgets,
    hiddenCount: hiddenWidgets.length,
    hasHiddenWidgets: hiddenWidgets.length > 0,
    toggleEditMode: store.toggleEditMode,
    resetToDefault: store.resetToDefault,
    applyPreset: store.applyPreset,
    toggleWidgetVisibility: store.toggleWidgetVisibility,
    isCurrentPreset,
  };
}
