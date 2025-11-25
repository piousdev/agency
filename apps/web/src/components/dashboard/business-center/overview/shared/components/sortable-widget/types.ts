import type { ReactNode } from 'react';
import type { WidgetSize } from '@/lib/stores/dashboard-store';

export type DragHandleProps = Readonly<Record<string, unknown>>;

export type SortableWidgetProps = Readonly<{
  id: string;
  size: WidgetSize;
  children: ReactNode;
  disabled?: boolean;
}>;

export type DragTransform = Readonly<{
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}>;

export type DragStyle = Readonly<{
  transform: string | undefined;
  transition: string | undefined;
}>;
