'use client';

import { useCallback } from 'react';

import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import type { WidgetLayout } from '@/lib/stores/dashboard-store';

export function useDragReorder(
  layout: WidgetLayout[],
  reorderWidgets: (oldIndex: number, newIndex: number) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = layout.findIndex((w) => w.id === active.id);
        const newIndex = layout.findIndex((w) => w.id === over.id);
        reorderWidgets(oldIndex, newIndex);
      }
    },
    [layout, reorderWidgets]
  );

  return { sensors, handleDragEnd };
}
