'use client';

import { ReactNode, Children, cloneElement, isValidElement } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { getWidgetSizeClasses } from './widget-grid';
import type { WidgetSize } from '@/lib/stores/dashboard-store';

interface SortableWidgetProps {
  id: string;
  size: WidgetSize;
  children: ReactNode;
  disabled?: boolean;
}

export function SortableWidget({ id, size, children, disabled }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Clone children with drag handle props
  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, {
        dragHandleProps: { ...attributes, ...listeners },
      } as Record<string, unknown>);
    }
    return child;
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(getWidgetSizeClasses(size), isDragging && 'opacity-50 z-50')}
    >
      {childrenWithProps}
    </div>
  );
}
