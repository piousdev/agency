'use client';

/**
 * Icon Container Component
 * Reusable icon container for widget states
 */

import { cn } from '@/lib/utils';
import type {
  IconContainerProps,
  IconContainerSize,
} from '@/components/dashboard/business-center/overview/shared/components/widget-error/types';
import {
  getIconContainerClasses,
  getIconColorClasses,
} from '@/components/dashboard/business-center/overview/shared/components/widget-error/utils';

/**
 * Icon container with variant-based styling
 * Used by error, empty, and info states
 */
export function IconContainer({ children, variant, size = 'md', className }: IconContainerProps) {
  const containerClasses = getIconContainerClasses(variant, size);
  const iconColorClasses = getIconColorClasses(variant);

  return (
    <div className={cn(containerClasses, className)}>
      <div className={iconColorClasses}>{children}</div>
    </div>
  );
}

IconContainer.displayName = 'IconContainer';
