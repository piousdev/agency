'use client';

import { cn } from '@/lib/utils';

import type { WidgetSize } from '@/lib/stores/dashboard-store';
import type { ReactNode } from 'react';

// Widget size to grid classes mapping
const WIDGET_SIZE_CLASSES: Record<WidgetSize, string> = {
  small: 'col-span-4 md:col-span-4 lg:col-span-3',
  medium: 'col-span-4 md:col-span-4 lg:col-span-6',
  large: 'col-span-4 md:col-span-8 lg:col-span-12',
};

interface WidgetGridProps {
  children: ReactNode;
  className?: string;
}

export function WidgetGrid({ children, className }: WidgetGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-4', // Mobile: 4 columns (effectively single column)
        'md:grid-cols-8', // Tablet: 8 columns
        'lg:grid-cols-12', // Desktop: 12 columns
        className
      )}
    >
      {children}
    </div>
  );
}

interface WidgetSlotProps {
  size: WidgetSize;
  children: ReactNode;
  className?: string;
}

export function WidgetSlot({ size, children, className }: WidgetSlotProps) {
  return <div className={cn(WIDGET_SIZE_CLASSES[size], className)}>{children}</div>;
}

// Helper to get widget size classes
export function getWidgetSizeClasses(size: WidgetSize): string {
  return WIDGET_SIZE_CLASSES[size];
}
