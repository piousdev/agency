import { memo } from 'react';

interface UnknownWidgetProps {
  readonly type: string;
}

export const UnknownWidget = memo(function UnknownWidget({ type }: UnknownWidgetProps) {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
      <p className="text-sm font-medium">{type}</p>
      <p className="text-xs">Widget coming soon</p>
    </div>
  );
});

/**
 * Creates an UnknownWidget component bound to a specific type.
 * Used as a factory for the widget registry fallback.
 */
export function createUnknownWidget(type: string): React.ComponentType {
  return function BoundUnknownWidget() {
    return <UnknownWidget type={type} />;
  };
}
