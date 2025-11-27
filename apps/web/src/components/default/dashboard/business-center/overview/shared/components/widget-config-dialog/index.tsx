// components/widget-config-dialog/widget-config-dialog.tsx
'use client';

import { useState } from 'react';

import { ConfigFieldRenderer } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/components/config-field-renderer';
import { DIALOG_TEXT } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Item, ItemContent, ItemFooter } from '@/components/ui/item';
import { useDashboardStore, DEFAULT_WIDGET_CONFIGS } from '@/lib/stores/dashboard-store';

import type { WidgetConfigDialogProps } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/types';


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
    const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType];
    setLocalConfig(defaultConfig);
  };

  const updateConfig = (key: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      aria-label={widgetTitle}
      data-testid="widget-config-dialog"
    >
      <DialogContent
        className="sm:max-w-[425px]"
        aria-label={widgetTitle}
        data-testid="widget-config-dialog-content"
      >
        <Item className="p-0" aria-label={widgetTitle} data-testid="widget-config-dialog">
          <DialogHeader aria-label={widgetTitle} data-testid="widget-config-dialog-header">
            <DialogTitle aria-label={widgetTitle} data-testid="widget-config-dialog-title">
              {DIALOG_TEXT.TITLE_PREFIX} {widgetTitle}
            </DialogTitle>
            <DialogDescription
              aria-label={widgetTitle}
              data-testid="widget-config-dialog-description"
            >
              {DIALOG_TEXT.DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <ItemContent
            className="grid gap-4 py-4"
            aria-label={widgetTitle}
            data-testid="widget-config-field-renderer-container"
            role="grid"
          >
            <ConfigFieldRenderer
              widgetType={widgetType}
              config={localConfig}
              updateConfig={updateConfig}
            />
          </ItemContent>
          <DialogFooter
            className="flex gap-2 w-full"
            aria-label={widgetTitle}
            data-testid="widget-config-dialog-footer"
          >
            <ItemFooter
              className="flex gap-2 w-full"
              aria-label={widgetTitle}
              data-testid="widget-config-dialog-footer"
            >
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
                aria-label={widgetTitle}
                data-testid="widget-config-dialog-reset-button"
              >
                {DIALOG_TEXT.RESET_BUTTON}
              </Button>
              <Button
                onClick={handleSave}
                className="flex-2"
                aria-label={widgetTitle}
                data-testid="widget-config-dialog-save-button"
              >
                {DIALOG_TEXT.SAVE_BUTTON}
              </Button>
            </ItemFooter>
          </DialogFooter>
        </Item>
      </DialogContent>
    </Dialog>
  );
}
