import React, { type ComponentType } from 'react';

import {
  IconAlertSquareRounded,
  IconCalendar,
  IconCurrency,
  IconHistory,
  IconLayout,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';

import { LazyWidgetContent } from '@/components/default/dashboard/business-center/overview/widgets';

/**
 * Configuration object mapping widget types to their respective titles and icons.
 *
 * Each key in the object represents a widget type, and the value is an object
 * containing the following properties:
 * - `title` (string): The display title of the widget.
 * - `Icon` (ComponentType): The React component representing the icon associated with the widget.
 */
const WIDGET_CONFIG = {
  'organization-health': { title: 'Organization Health', Icon: IconLayout },
  'critical-alerts': { title: 'Critical Alerts', Icon: IconAlertSquareRounded },
  'team-status': { title: 'Team Status', Icon: IconUsers },
  'intake-pipeline': { title: 'Intake Pipeline', Icon: IconLayout },
  'upcoming-deadlines': { title: 'Upcoming Deadlines', Icon: IconCalendar },
  'recent-activity': { title: 'Recent Activity', Icon: IconHistory },
  'financial-snapshot': { title: 'Financial Snapshot', Icon: IconCurrency },
  'my-work-today': { title: 'My Work Today', Icon: IconUser },
  'current-sprint': { title: 'Current Sprint', Icon: IconLayout },
  'risk-indicators': { title: 'Risk Indicators', Icon: IconAlertSquareRounded },
  blockers: { title: 'Blockers', Icon: IconAlertSquareRounded },
} as const satisfies Record<string, { title: string; Icon: ComponentType }>;

/**
 * Type representing the keys of the WIDGET_CONFIG object.
 *
 * This type is used to ensure that only valid widget types
 * defined in the WIDGET_CONFIG object are used.
 */
export type WidgetType = keyof typeof WIDGET_CONFIG;

/**
 * Retrieves the title of a widget based on its type.
 *
 * @param {WidgetType} type - The type of the widget.
 * @returns {string} - The title of the widget.
 */
export function getWidgetTitle(type: WidgetType): string {
  return WIDGET_CONFIG[type].title;
}

/**
 * Retrieves the icon of a widget based on its type.
 *
 * @param {WidgetType} type - The type of the widget.
 * @param {{ size?: number; stroke?: number }} [props] - Optional properties to customize the icon.
 * @param {number} [props.size] - The size of the icon.
 * @param {number} [props.stroke] - The stroke width of the icon.
 * @returns {React.ReactNode} - The React component representing the widget's icon.
 */
export function getWidgetIcon(
  type: WidgetType,
  props?: { size?: number; stroke?: number }
): React.ReactNode {
  const Icon = WIDGET_CONFIG[type].Icon;
  return <Icon {...props} />;
}

/**
 * Re-exports the `LazyWidgetContent` component as `WidgetContent`.
 *
 * This allows the `LazyWidgetContent` component to be imported using the alias `WidgetContent`.
 */
export { LazyWidgetContent as WidgetContent };
