// Widget components
export { QuickActionsWidget, QuickActionsCompact, QuickActionsGrid } from './quick-actions';
export { MyWorkTodayWidget, MyWorkTodaySummary } from './my-work-today';
export { UpcomingDeadlinesWidget } from './upcoming-deadlines';
export { RecentActivityWidget } from './recent-activity';
export { CurrentSprintWidget } from './current-sprint';
export { OrganizationHealthWidget } from './organization-health';
export { TeamStatusWidget } from './team-status';
export { BlockersWidget } from './blockers';
export { FinancialSnapshotWidget } from './financial-snapshot';
export { RiskIndicatorsWidget } from './risk-indicators';
export { CriticalAlertsWidget } from './critical-alerts';
export { CommunicationHubWidget } from './communication-hub';

// Lazy-loaded widgets with Suspense boundaries
export {
  LazyWidgetContent,
  getLazyWidget,
  lazyWidgetMap,
  SuspenseQuickActionsGrid,
  SuspenseMyWorkTodayWidget,
  SuspenseUpcomingDeadlinesWidget,
  SuspenseRecentActivityWidget,
  SuspenseCurrentSprintWidget,
  SuspenseOrganizationHealthWidget,
  SuspenseTeamStatusWidget,
  SuspenseBlockersWidget,
  SuspenseFinancialSnapshotWidget,
  SuspenseRiskIndicatorsWidget,
  SuspenseCriticalAlertsWidget,
  SuspenseCommunicationHubWidget,
} from './lazy-widgets';
