/**
 * Widget Container Utilities
 * Pure utility functions for widget container operations
 */

import type { WidgetContainerCallbacks } from '@/components/default/dashboard/business-center/overview/shared/components/widget-container/type';

/**
 * Checks if any action handlers are provided
 * @param callbacks - Widget callback handlers
 * @returns true if at least one handler exists
 */
export const hasActions = (callbacks: Partial<WidgetContainerCallbacks>): boolean =>
  Boolean(callbacks.onRefresh ?? callbacks.onConfigure ?? callbacks.onRemove);

/**
 * Checks if widget has refresh capability
 * @param callbacks - Widget callback handlers
 * @returns true if refresh handler exists
 */
export const canRefresh = (callbacks: Partial<WidgetContainerCallbacks>): boolean =>
  Boolean(callbacks.onRefresh);

/**
 * Checks if widget is collapsible
 * @param onToggleCollapse - Toggle collapse handler
 * @returns true if collapse handler exists
 */
export const isCollapsible = (onToggleCollapse?: () => void): boolean => Boolean(onToggleCollapse);

/**
 * Checks if widget is in edit mode with drag capability
 * @param editMode - Edit mode flag
 * @param dragHandleProps - Drag handle properties
 * @returns true if widget can be dragged
 */
export const isDraggable = (
  editMode?: boolean,
  dragHandleProps?: Readonly<Record<string, unknown>>
): boolean => Boolean(editMode && dragHandleProps);

/**
 * Determines if menu should be visible
 * @param hasAnyAction - Whether any action exists
 * @returns true if menu should render
 */
export const shouldShowMenu = (hasAnyAction: boolean): boolean => hasAnyAction;

/**
 * Gets the appropriate ARIA label for collapse/expand button
 * @param collapsed - Current collapsed state
 * @param expandLabel - Label for expand action
 * @param collapseLabel - Label for collapse action
 * @returns Appropriate ARIA label
 */
export const getCollapseAriaLabel = (
  collapsed: boolean | undefined,
  expandLabel: string,
  collapseLabel: string
): string => (collapsed ? expandLabel : collapseLabel);
