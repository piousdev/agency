// components/widget-config-dialog/widget-config-dialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDashboardStore, DEFAULT_WIDGET_CONFIGS } from '@/lib/stores/dashboard-store';
import type { WidgetConfigDialogProps } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';
import { ConfigFieldRenderer } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/components/config-field-renderer';
import { DIALOG_TEXT } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';

export function WidgetConfigDialog({
  open,
  onOpenChange,
  widgetId,
  widgetType,
  widgetTitle,
}: WidgetConfigDialogProps) {
  const { getWidgetConfig, setWidgetConfig } = useDashboardStore();
  const currentConfig = getWidgetConfig(widgetId, widgetType);
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(currentConfig);

  const handleSave = () => {
    setWidgetConfig(widgetId, localConfig);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType] || {};
    setLocalConfig(defaultConfig);
  };

  const updateConfig = (key: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {DIALOG_TEXT.TITLE_PREFIX} {widgetTitle}
          </DialogTitle>
          <DialogDescription>{DIALOG_TEXT.DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ConfigFieldRenderer
            widgetType={widgetType}
            config={localConfig}
            updateConfig={updateConfig}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset}>
            {DIALOG_TEXT.RESET_BUTTON}
          </Button>
          <Button onClick={handleSave}>{DIALOG_TEXT.SAVE_BUTTON}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
