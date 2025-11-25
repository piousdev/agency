import type {
  MyWorkTodayConfig,
  RecentActivityConfig,
  UpcomingDeadlinesConfig,
  CurrentSprintConfig,
  OrganizationHealthConfig,
  TeamStatusConfig,
} from '@/lib/stores/dashboard-store';

export type WidgetConfig =
  | MyWorkTodayConfig
  | RecentActivityConfig
  | UpcomingDeadlinesConfig
  | CurrentSprintConfig
  | OrganizationHealthConfig
  | TeamStatusConfig;

export type WidgetConfigDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId: string;
  widgetType: string;
  widgetTitle: string;
}>;

export type ConfigFieldsProps<T> = Readonly<{
  config: T;
  updateConfig: (key: string, value: unknown) => void;
}>;

export type DeadlineType = 'task' | 'project' | 'milestone' | 'meeting' | 'invoice';

export type PriorityFilter = 'all' | 'urgent' | 'high' | 'medium' | 'low';

export type ActivityFilter = 'all' | 'tickets' | 'projects' | 'clients' | 'files' | 'comments';
