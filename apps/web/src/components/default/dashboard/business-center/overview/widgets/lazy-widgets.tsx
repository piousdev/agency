'use client';

import { memo, createElement, type ComponentType } from 'react';

import { createUnknownWidget } from '@/components/default/dashboard/business-center/overview/components/unknown-widget';
import { isKnownWidgetType } from '@/components/default/dashboard/business-center/overview/types';
// Eager widget imports - no lazy loading, no Suspense
// Route-level loading.tsx handles the loading state
import { BlockersWidget } from '@/components/default/dashboard/business-center/overview/widgets/blockers';
import { CommunicationHubWidget } from '@/components/default/dashboard/business-center/overview/widgets/communication-hub';
import { CriticalAlertsWidget } from '@/components/default/dashboard/business-center/overview/widgets/critical-alerts';
import { CurrentSprintWidget } from '@/components/default/dashboard/business-center/overview/widgets/current-sprint';
import { FinancialSnapshotWidget } from '@/components/default/dashboard/business-center/overview/widgets/financial-snapshot';
import { MyWorkTodayWidget } from '@/components/default/dashboard/business-center/overview/widgets/my-work-today';
import { OrganizationHealthWidget } from '@/components/default/dashboard/business-center/overview/widgets/organization-health';
import { RecentActivityWidget } from '@/components/default/dashboard/business-center/overview/widgets/recent-activity';
import { RiskIndicatorsWidget } from '@/components/default/dashboard/business-center/overview/widgets/risk-indicators';
import { TeamStatusWidget } from '@/components/default/dashboard/business-center/overview/widgets/team-status';
import { UpcomingDeadlinesWidget } from '@/components/default/dashboard/business-center/overview/widgets/upcoming-deadlines';

import type { WidgetType } from '@/components/default/dashboard/business-center/overview/types';

/**
 * Eager widget map - directly renders widgets without Suspense boundaries.
 * The route-level loading.tsx handles the loading skeleton state.
 */
const EAGER_WIDGET_MAP: Readonly<Record<WidgetType, ComponentType>> = {
  'my-work-today': MyWorkTodayWidget,
  'upcoming-deadlines': UpcomingDeadlinesWidget,
  'recent-activity': RecentActivityWidget,
  'current-sprint': CurrentSprintWidget,
  'organization-health': OrganizationHealthWidget,
  'team-status': TeamStatusWidget,
  blockers: BlockersWidget,
  'financial-snapshot': FinancialSnapshotWidget,
  'risk-indicators': RiskIndicatorsWidget,
  'critical-alerts': CriticalAlertsWidget,
  'communication-hub': CommunicationHubWidget,
} as const;

/**
 * Cache for unknown widget components.
 * Prevents recreating components on each render.
 */
const unknownWidgetCache = new Map<string, ComponentType>();

/**
 * Gets the appropriate widget component for a given type.
 * Returns eager widget for known types, or UnknownWidget for unknown types.
 */
export function getLazyWidget(type: string): ComponentType {
  // Check for known widget type
  if (isKnownWidgetType(type)) {
    return EAGER_WIDGET_MAP[type];
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
 * Renders a widget by type.
 *
 * Known widget types are rendered eagerly (no Suspense).
 * The route-level loading.tsx handles the loading skeleton state.
 * Unknown types display a placeholder message.
 */
export const LazyWidgetContent = memo(function LazyWidgetContent({ type }: LazyWidgetContentProps) {
  const Widget = getLazyWidget(type);
  return createElement(Widget);
});

/**
 * Direct access to the widget map for advanced use cases.
 * Prefer using LazyWidgetContent or getLazyWidget for most scenarios.
 */
export const lazyWidgetMap = EAGER_WIDGET_MAP;
