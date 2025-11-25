import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { getWidgetTitle } from '@/components/dashboard/business-center/overview/utils/layout';
import type { WidgetLayout } from '@/components/dashboard/business-center/overview/types';

interface HiddenWidgetButtonProps {
  readonly widget: WidgetLayout;
  readonly onAdd: (widgetId: string) => void;
}

interface AddWidgetPopoverProps {
  readonly hiddenWidgets: readonly WidgetLayout[];
  readonly hiddenCount: number;
  readonly hasHiddenWidgets: boolean;
  readonly onAddWidget: (widgetId: string) => void;
}

const HiddenWidgetButton = ({ widget, onAdd }: HiddenWidgetButtonProps) => {
  const handleClick = () => onAdd(widget.id);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start text-sm"
      onClick={handleClick}
    >
      <IconPlus className="h-4 w-4 mr-2" aria-hidden="true" />
      {getWidgetTitle(widget.type)}
    </Button>
  );
};

export const AddWidgetPopover = ({
  hiddenWidgets,
  hiddenCount,
  hasHiddenWidgets,
  onAddWidget,
}: AddWidgetPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={!hasHiddenWidgets}>
          <IconPlus className="h-4 w-4" aria-hidden="true" />
          Add Widget
          {hasHiddenWidgets && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
              {hiddenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-1">
          <p className="text-sm font-medium px-2 py-1">Available Widgets</p>
          {!hasHiddenWidgets ? (
            <p className="text-xs text-muted-foreground px-2 py-2">
              All widgets are currently visible
            </p>
          ) : (
            hiddenWidgets.map((widget) => (
              <HiddenWidgetButton key={widget.id} widget={widget} onAdd={onAddWidget} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
