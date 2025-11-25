'use client';

import { memo } from 'react';
import { useLayoutInit } from '@/components/dashboard/business-center/overview/hooks';
import { useEditModeState } from '@/components/dashboard/business-center/overview/hooks';
import { SettingsMenu } from '@/components/dashboard/business-center/overview/components/settings-menu';
import { AddWidgetPopover } from '@/components/dashboard/business-center/overview/components/add-widget-popover';
import { LayoutPresetsMenu } from '@/components/dashboard/business-center/overview/components/layout-presets-menu';
import { DoneButton } from '@/components/dashboard/business-center/overview/components/done-button';

export interface EditModeToggleProps {
  readonly userRole: string;
}

export const EditModeToggle = memo(function EditModeToggle({ userRole }: EditModeToggleProps) {
  // Initialize layout from role defaults if needed
  useLayoutInit({ userRole });

  const {
    editMode,
    hiddenWidgets,
    hiddenCount,
    hasHiddenWidgets,
    toggleEditMode,
    resetToDefault,
    applyPreset,
    toggleWidgetVisibility,
    isCurrentPreset,
  } = useEditModeState();

  return (
    <>
      {/* Settings Menu (always visible) */}
      <SettingsMenu
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        onResetLayout={resetToDefault}
        onApplyPreset={applyPreset}
        isCurrentPreset={isCurrentPreset}
      />

      {/* Edit Mode Controls */}
      {editMode && (
        <>
          <AddWidgetPopover
            hiddenWidgets={hiddenWidgets}
            hiddenCount={hiddenCount}
            hasHiddenWidgets={hasHiddenWidgets}
            onAddWidget={toggleWidgetVisibility}
          />
          <LayoutPresetsMenu onApplyPreset={applyPreset} onResetToDefault={resetToDefault} />
          <DoneButton onClick={toggleEditMode} />
        </>
      )}
    </>
  );
});

// Default export for backwards compatibility
export default EditModeToggle;
