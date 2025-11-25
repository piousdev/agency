'use client';

import { memo, type ComponentType } from 'react';
import { isKnownWidgetType } from '@/components/dashboard/business-center/overview/types';
import {
  getSuspenseWidget,
  SUSPENSE_WIDGET_MAP,
} from '@/components/dashboard/business-center/overview/registry/widget';
import { createUnknownWidget } from '@/components/dashboard/business-center/overview/components/unknown-widget';

/**
 * Cache for unknown widget components.
 * Prevents recreating components on each render.
 */
const unknownWidgetCache = new Map<string, ComponentType>();

/**
 * Gets the appropriate widget component for a given type.
 * Returns a Suspense-wrapped lazy component for known types,
 * or an UnknownWidget placeholder for unknown types.
 */
export function getLazyWidget(type: string): ComponentType {
  // Check for known widget type
  if (isKnownWidgetType(type)) {
    return getSuspenseWidget(type);
  }

  // Check cache for unknown widget
  const cached = unknownWidgetCache.get(type);
  if (cached) return cached;

  // Create and cache unknown widget
  const UnknownWidgetComponent = createUnknownWidget(type);
  unknownWidgetCache.set(type, UnknownWidgetComponent);

  return UnknownWidgetComponent;
}

export interface LazyWidgetContentProps {
  readonly type: string;
}

/**
 * Renders a lazy-loaded widget by type.
 *
 * Known widget types are wrapped with Suspense and appropriate skeleton fallbacks.
 * Unknown types display a placeholder message.
 */
export const LazyWidgetContent = memo(function LazyWidgetContent({ type }: LazyWidgetContentProps) {
  const Widget = getLazyWidget(type);
  return <Widget />;
});

/**
 * Direct access to the widget map for advanced use cases.
 * Prefer using LazyWidgetContent or getLazyWidget for most scenarios.
 */
export const lazyWidgetMap = SUSPENSE_WIDGET_MAP;
