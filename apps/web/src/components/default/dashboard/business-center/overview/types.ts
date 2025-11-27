import type {
  Notification as APINotification,
  NotificationType as APINotificationType,
} from '@/lib/api/notifications';
import type { ComponentType, LazyExoticComponent } from 'react';

// Generic type guard helper
export function isValidOption<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T);
}

// Upcoming Deadlines Related Types
export interface DeadlineItem {
  id: string;
  title: string;
  type: 'project' | 'milestone' | 'ticket' | 'deliverable';
  dueAt: string;
  projectName?: string;
  clientName?: string;
  isOverdue?: boolean;
}

export type DeadlineType = DeadlineItem['type'];

export interface UseDeadlinesOptions {
  deadlines?: DeadlineItem[];
}

export interface UseDeadlinesReturn {
  deadlines: DeadlineItem[];
  isEmpty: boolean;
  overdueCount: number;
}

// Team status related types
export const TEAM_MEMBER_STATUSES = [
  'available',
  'busy',
  'at_capacity',
  'overloaded',
  'away',
] as const;

export type TeamMemberStatus = (typeof TEAM_MEMBER_STATUSES)[number];

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly image?: string;
  readonly status: TeamMemberStatus;
  readonly currentProject?: string;
  readonly tasksInProgress: number;
}

export interface TeamStats {
  readonly available: number;
  readonly busy: number;
  readonly overloaded: number;
  readonly totalTasks: number;
  readonly avgTasks: number;
}

// Type guard for runtime validation for team member status
export function isValidTeamMemberStatus(status: unknown): status is TeamMemberStatus {
  return isValidOption(status, TEAM_MEMBER_STATUSES);
}

// risk-indicators related types
export const RISK_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const RISK_CATEGORIES = ['schedule', 'budget', 'scope', 'resource', 'quality'] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export interface RiskIndicator {
  readonly id: string;
  readonly category: RiskCategory;
  readonly projectId: string;
  readonly projectName: string;
  readonly severity: RiskSeverity;
  readonly description: string;
  readonly impact: string;
  readonly mitigation?: string;
  readonly createdAt: string;
}

export interface RiskSummary {
  readonly total: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly risks: readonly RiskIndicator[];
}

export interface RiskSeverityConfig {
  readonly badgeClass: string;
  readonly borderClass: string;
  readonly label: string;
}

export interface RiskCategoryConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly label: string;
}

// Type guards for runtime validation for risk indicators
export function isValidRiskSeverity(value: unknown): value is RiskSeverity {
  return isValidOption(value, RISK_SEVERITIES);
}

export function isValidRiskCategory(value: unknown): value is RiskCategory {
  return isValidOption(value, RISK_CATEGORIES);
}

// Activity related types
export const ACTIVITY_TYPES = [
  'comment_added',
  'file_uploaded',
  'task_completed',
  'task_updated',
  'member_joined',
  'project_created',
  'project_updated',
  'ticket_created',
  'ticket_updated',
  'ticket_assigned',
  'ticket_deleted',
  'client_created',
  'client_updated',
] as const;

export type KnownActivityType = (typeof ACTIVITY_TYPES)[number];

// Allow unknown types from server while maintaining type safety
export type ActivityType = KnownActivityType | Omit<string, KnownActivityType>;

export const FILTER_CATEGORIES = [
  'all',
  'tickets',
  'projects',
  'clients',
  'files',
  'comments',
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export interface ActivityUser {
  readonly name: string;
  readonly image?: string;
}

export interface ActivityMetadata {
  readonly projectName?: string;
  readonly ticketTitle?: string;
  readonly fileName?: string;
}

export interface ActivityItem {
  readonly id: string;
  readonly type: ActivityType;
  readonly description: string;
  readonly timestamp: string;
  readonly user: ActivityUser;
  readonly metadata?: ActivityMetadata;
}

export interface ActivityTypeConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly colorClass: string;
}

// Type guard for known activity types
export function isKnownActivityType(type: unknown): type is KnownActivityType {
  return isValidOption(type, ACTIVITY_TYPES);
}

// Type guard for filter categories for activity
export function isValidFilterCategory(value: unknown): value is FilterCategory {
  return isValidOption(value, FILTER_CATEGORIES);
}

// Health metrics related types
export const TREND_DIRECTIONS = ['up', 'down', 'stable', 'neutral'] as const;
export type TrendDirection = (typeof TREND_DIRECTIONS)[number];

export const HEALTH_LEVELS = ['excellent', 'good', 'poor'] as const;
export type HealthLevel = (typeof HEALTH_LEVELS)[number];

export interface HealthMetric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly trend: TrendDirection;
  readonly trendValue: number;
  readonly icon: ComponentType<{ className?: string }>;
  readonly drilldownUrl?: string;
}

export interface HealthMetricConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly defaultUrl: string;
}

export interface TrendConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly colorClass: string;
}

export interface HealthLevelConfig {
  readonly threshold: number;
  readonly progressClass: string;
  readonly badgeClass: string;
  readonly indicator: React.ElementType;
}
// Type guard for trend direction
export function isValidTrend(value: unknown): value is TrendDirection {
  return isValidOption(value, TREND_DIRECTIONS);
}

// Normalize server trend values
export function normalizeTrend(trend: string | undefined): TrendDirection {
  if (trend === 'neutral') return 'stable';
  if (isValidTrend(trend)) return trend;
  return 'stable';
}

// Task related types
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  'open',
  'in_progress',
  'pending_client',
  'resolved',
  'closed',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const SORT_OPTIONS = ['due_date', 'priority', 'points'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const FILTER_OPTIONS = ['all', 'high_priority', 'due_today', 'blocked'] as const;
export type FilterOption = (typeof FILTER_OPTIONS)[number];

export interface TaskItem {
  readonly id: string;
  readonly title: string;
  readonly projectName?: string | null;
  readonly priority: TaskPriority;
  readonly dueAt?: string | null;
  readonly status: TaskStatus;
  readonly ticketNumber?: string | null;
  readonly storyPoints?: number | null;
  readonly isBlocked?: boolean;
}

export interface TaskSummaryStats {
  readonly completed: number;
  readonly inProgress: number;
  readonly overdue: number;
}

// Type guards for runtime validation of task related types
export function isValidPriority(value: unknown): value is TaskPriority {
  return isValidOption(value, TASK_PRIORITIES);
}

export function isValidTaskStatus(value: unknown): value is TaskStatus {
  return isValidOption(value, TASK_STATUSES);
}

export function isValidSortOption(value: unknown): value is SortOption {
  return isValidOption(value, SORT_OPTIONS);
}

export function isValidFilterOption(value: unknown): value is FilterOption {
  return isValidOption(value, FILTER_OPTIONS);
}

// Lazy Widget related types
export const WIDGET_TYPES = [
  'my-work-today',
  'upcoming-deadlines',
  'recent-activity',
  'current-sprint',
  'organization-health',
  'team-status',
  'blockers',
  'financial-snapshot',
  'risk-indicators',
  'critical-alerts',
  'communication-hub',
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LazyWidgetComponent = LazyExoticComponent<ComponentType<any>>;

export type SkeletonComponent = ComponentType<{ className?: string }>;

export interface WidgetConfig {
  readonly lazy: LazyWidgetComponent;
  readonly skeleton: SkeletonComponent;
}

export type WidgetRegistry = Readonly<Record<WidgetType, WidgetConfig>>;

// Type guard for known widget types
export function isKnownWidgetType(type: unknown): type is WidgetType {
  return isValidOption(type, WIDGET_TYPES);
}

// Financial snapshot related types
export const WIDGET_VARIANTS = ['admin', 'client'] as const;
export type WidgetVariant = (typeof WIDGET_VARIANTS)[number];

export const VALUE_FORMATS = ['currency', 'percent', 'number'] as const;
export type ValueFormat = (typeof VALUE_FORMATS)[number];

export const BUDGET_LEVELS = ['normal', 'warning', 'critical'] as const;
export type BudgetLevel = (typeof BUDGET_LEVELS)[number];

export interface FinancialMetric {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly change: number;
  readonly trend: TrendDirection;
  readonly format: ValueFormat;
}

export interface FinancialSnapshot {
  readonly revenue: FinancialMetric;
  readonly outstanding: FinancialMetric;
  readonly overdue: FinancialMetric;
  readonly paidThisMonth: FinancialMetric;
  readonly projectBudgetUsed: number;
  readonly projectBudgetTotal: number;
}

export interface MetricDisplayConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly isPositiveGood: boolean;
}

// Type guards
export function isValidVariant(value: unknown): value is WidgetVariant {
  return isValidOption(value, WIDGET_VARIANTS);
}

export function isValidFormat(value: unknown): value is ValueFormat {
  return isValidOption(value, VALUE_FORMATS);
}

// Layout related types
export const LAYOUT_PRESETS = ['admin', 'pm', 'developer', 'designer', 'qa', 'client'] as const;

export type LayoutPreset = (typeof LAYOUT_PRESETS)[number];

export interface WidgetLayout {
  readonly id: string;
  readonly type: string;
  readonly visible: boolean;
  readonly position: number;
  readonly size?: 'small' | 'medium' | 'large';
}

export interface PresetConfig {
  readonly id: LayoutPreset;
  readonly label: string;
  readonly description?: string;
}

// Type guards
export function isValidPreset(value: unknown): value is LayoutPreset {
  return isValidOption(value, LAYOUT_PRESETS);
}

export function isValidWidgetType(value: unknown): value is WidgetType {
  return isValidOption(value, WIDGET_TYPES);
}

// Sprint related types
export const SPRINT_STATUSES = ['todo', 'in_progress', 'completed', 'blocked'] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export interface BurndownDataPoint {
  readonly value: number;
  readonly label?: string;
}

export interface SprintData {
  readonly id: string;
  readonly name: string;
  readonly projectName: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly inProgressTasks: number;
  readonly blockedTasks: number;
  readonly daysRemaining: number;
  readonly burndownData?: readonly BurndownDataPoint[];
  readonly velocity?: number;
  readonly previousVelocity?: number;
}

export interface SprintStatConfig {
  readonly status: SprintStatus;
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly bgClass: string;
  readonly iconClass: string;
}

export interface SprintStats {
  readonly progress: number;
  readonly todoTasks: number;
  readonly isOnTrack: boolean;
  readonly velocityTrend: TrendDirection;
  readonly velocityChange: number;
}

// Type guard for trend direction
export function getTrendDirection(
  current: number | undefined,
  previous: number | undefined
): TrendDirection {
  if (current === undefined || previous === undefined) return 'stable';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

// Critical Alert related types
export const ALERT_TYPES = ['critical', 'warning', 'info'] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_FILTERS = ['all', 'critical', 'warning', 'info'] as const;
export type AlertFilter = (typeof ALERT_FILTERS)[number];

export const ENTITY_TYPES = ['project', 'ticket', 'client', 'sprint', 'system'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export interface AlertPayload {
  readonly id: string;
  readonly type: AlertType;
  readonly title: string;
  readonly message: string;
  // Allow unknown entity types from server while maintaining type safety
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  readonly entityType: EntityType | string;
  readonly entityId?: string;
  readonly entityName?: string;
  readonly actionUrl?: string;
  readonly createdAt: string;
}

export interface AlertTypeConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly color: string;
  readonly bgColor: string;
  readonly badgeClass: string;
}

export interface SnoozeOption {
  readonly label: string;
  readonly value: number;
}

export interface AlertCounts {
  readonly total: number;
  readonly critical: number;
  readonly warning: number;
  readonly info: number;
}

// Type guards
export function isValidAlertType(value: unknown): value is AlertType {
  return isValidOption(value, ALERT_TYPES);
}

export function isValidAlertFilter(value: unknown): value is AlertFilter {
  return isValidOption(value, ALERT_FILTERS);
}

// Notification related types
export type { APINotification, APINotificationType };

export const TAB_VALUES = ['all', 'mentions', 'comments'] as const;
export type TabValue = (typeof TAB_VALUES)[number];

export const DISPLAY_NOTIFICATION_TYPES = [
  'mention',
  'comment',
  'reply',
  'assignment',
  'update',
] as const;
export type DisplayNotificationType = (typeof DISPLAY_NOTIFICATION_TYPES)[number];

export const CONTEXT_TYPES = ['ticket', 'project', 'comment'] as const;
export type ContextType = (typeof CONTEXT_TYPES)[number];

export interface NotificationSender {
  readonly name: string;
  readonly image?: string;
}

export interface NotificationContext {
  readonly type: ContextType;
  readonly name: string;
  readonly url?: string;
}

export interface DisplayNotification {
  readonly id: string;
  readonly type: DisplayNotificationType;
  readonly title: string;
  readonly message: string;
  readonly timestamp: string;
  readonly read: boolean;
  readonly sender: NotificationSender;
  readonly context?: NotificationContext;
}

export interface NotificationTypeConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly colorClass: string;
}

export interface NotificationCounts {
  readonly total: number;
  readonly unread: number;
  readonly unreadMentions: number;
}

// Type guards
export function isValidTabValue(value: unknown): value is TabValue {
  return isValidOption(value, TAB_VALUES);
}

export function isValidDisplayType(value: unknown): value is DisplayNotificationType {
  return isValidOption(value, DISPLAY_NOTIFICATION_TYPES);
}

// Blocker related types
export const BLOCKER_SEVERITIES = ['critical', 'high', 'medium'] as const;
export type BlockerSeverity = (typeof BLOCKER_SEVERITIES)[number];

export interface BlockerItem {
  readonly id: string;
  readonly title: string;
  readonly severity: BlockerSeverity;
  readonly projectName: string;
  readonly daysBlocked: number;
  readonly assignee?: string;
  readonly reason?: string;
}

export interface SeverityConfig {
  readonly icon: ComponentType<{ className?: string }>;
  readonly bgClass: string;
  readonly textClass: string;
  readonly borderClass: string;
  readonly badgeClass: string;
}

// Type guard
export function isValidBlockerSeverity(value: unknown): value is BlockerSeverity {
  return isValidOption(value, BLOCKER_SEVERITIES);
}
