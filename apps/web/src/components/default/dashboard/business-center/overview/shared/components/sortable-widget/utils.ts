import { Children, cloneElement, isValidElement, type ReactNode } from 'react';

import { CSS } from '@dnd-kit/utilities';

import type {
  DragHandleProps,
  DragTransform,
} from '@/components/default/dashboard/business-center/overview/shared/components/sortable-widget/types';

export const transformDragStyle = (transform: DragTransform | null): string | undefined => {
  return transform ? CSS.Transform.toString(transform) : undefined;
};

export const cloneChildrenWithDragProps = (
  children: ReactNode,
  dragHandleProps: DragHandleProps
): ReactNode => {
  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { dragHandleProps } as Record<string, unknown>);
    }
    return child;
  });
};

export const getDragClasses = (isDragging: boolean): string => {
  return isDragging ? 'opacity-50 z-50' : '';
};
