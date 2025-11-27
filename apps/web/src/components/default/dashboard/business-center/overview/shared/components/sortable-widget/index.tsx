// components/sortable-widget/sortable-widget.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';

import { DRAG_DEFAULTS } from '@/components/default/dashboard/business-center/overview/shared/components/sortable-widget/constants';
import {
  transformDragStyle,
  cloneChildrenWithDragProps,
  getDragClasses,
} from '@/components/default/dashboard/business-center/overview/shared/components/sortable-widget/utils';
import { getWidgetSizeClasses } from '@/components/default/dashboard/business-center/overview/shared/components/widget-grid';
import { cn } from '@/lib/utils';

import type { SortableWidgetProps } from '@/components/default/dashboard/business-center/overview/shared/components/sortable-widget/types';


export function SortableWidget({
  id,
  size,
  children,
  disabled = DRAG_DEFAULTS.DISABLED,
}: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: transformDragStyle(transform),
    transition,
  };

  const dragHandleProps = { ...attributes, ...listeners };
  const childrenWithProps = cloneChildrenWithDragProps(children, dragHandleProps);
  const dragClasses = getDragClasses(isDragging);

  return (
    <div ref={setNodeRef} style={style} className={cn(getWidgetSizeClasses(size), dragClasses)}>
      {childrenWithProps}
    </div>
  );
}
