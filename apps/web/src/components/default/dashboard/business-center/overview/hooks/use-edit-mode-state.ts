import { useMemo, useCallback } from 'react';

import {
  getHiddenWidgets,
  areLayoutsEqual,
} from '@/components/default/dashboard/business-center/overview/utils/layout';
import { useEditMode, useLayout, useDashboardStore } from '@/lib/stores/dashboard-store';

import type {
  WidgetLayout,
  LayoutPreset,
} from '@/components/default/dashboard/business-center/overview/types';

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

  const handleResetToDefault = useCallback(() => {
    void store.resetToDefault();
  }, [store]);

  const handleApplyPreset = useCallback(
    (preset: LayoutPreset) => {
      store.applyPreset(preset);
    },
    [store]
  );

  return {
    editMode,
    layout,
    hiddenWidgets,
    hiddenCount: hiddenWidgets.length,
    hasHiddenWidgets: hiddenWidgets.length > 0,
    toggleEditMode: store.toggleEditMode,
    resetToDefault: handleResetToDefault,
    applyPreset: handleApplyPreset,
    toggleWidgetVisibility: store.toggleWidgetVisibility,
    isCurrentPreset,
  };
}
