import { WIDGET_TITLES } from '../constants/preset-config';

import type { WidgetLayout } from '../types';

/**
 * Gets human-readable widget title.
 */
export function getWidgetTitle(type: string): string {
  return WIDGET_TITLES[type] ?? formatTypeAsTitle(type);
}

/**
 * Formats a widget type string as a readable title (fallback).
 */
function formatTypeAsTitle(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Compares two layouts for equality.
 * Uses stable comparison instead of JSON.stringify.
 */
export function areLayoutsEqual(
  layoutA: readonly WidgetLayout[],
  layoutB: readonly WidgetLayout[]
): boolean {
  if (layoutA.length !== layoutB.length) return false;

  // Sort both layouts by ID for consistent comparison
  const sortedA = [...layoutA].sort((a, b) => a.id.localeCompare(b.id));
  const sortedB = [...layoutB].sort((a, b) => a.id.localeCompare(b.id));

  return sortedA.every((widgetA, index) => {
    const widgetB = sortedB[index];
    return (
      widgetA.id === widgetB?.id &&
      widgetA.type === widgetB.type &&
      widgetA.visible === widgetB.visible &&
      widgetA.position === widgetB.position &&
      widgetA.size === widgetB.size
    );
  });
}

/**
 * Filters layout to get only hidden widgets.
 */
export function getHiddenWidgets(layout: readonly WidgetLayout[]): readonly WidgetLayout[] {
  return layout.filter((widget) => !widget.visible);
}

/**
 * Filters layout to get only visible widgets.
 */
export function getVisibleWidgets(layout: readonly WidgetLayout[]): readonly WidgetLayout[] {
  return layout.filter((widget) => widget.visible);
}
