// components/widget-config-dialog/config-field-renderer.tsx
import type { ReactNode } from 'react';
import type {
  MyWorkTodayConfig,
  RecentActivityConfig,
  UpcomingDeadlinesConfig,
  CurrentSprintConfig,
  OrganizationHealthConfig,
  TeamStatusConfig,
} from '@/lib/stores/dashboard-store';
import { DIALOG_TEXT } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';
import { MyWorkTodayConfigFields } from './my-work-today-config';
import { RecentActivityConfigFields } from './recent-activity-config';
import { UpcomingDeadlinesConfigFields } from './upcoming-deadlines-config';
import { CurrentSprintConfigFields } from './current-sprint-config';
import { OrganizationHealthConfigFields } from './organization-health-config';
import { TeamStatusConfigFields } from './team-status-config';

type ConfigFieldRendererProps = Readonly<{
  widgetType: string;
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}>;

export function ConfigFieldRenderer({
  widgetType,
  config,
  updateConfig,
}: ConfigFieldRendererProps): ReactNode {
  switch (widgetType) {
    case 'my-work-today':
      return (
        <MyWorkTodayConfigFields
          config={config as unknown as MyWorkTodayConfig}
          updateConfig={updateConfig}
        />
      );
    case 'recent-activity':
      return (
        <RecentActivityConfigFields
          config={config as unknown as RecentActivityConfig}
          updateConfig={updateConfig}
        />
      );
    case 'upcoming-deadlines':
      return (
        <UpcomingDeadlinesConfigFields
          config={config as unknown as UpcomingDeadlinesConfig}
          updateConfig={updateConfig}
        />
      );
    case 'current-sprint':
      return (
        <CurrentSprintConfigFields
          config={config as unknown as CurrentSprintConfig}
          updateConfig={updateConfig}
        />
      );
    case 'organization-health':
      return (
        <OrganizationHealthConfigFields
          config={config as unknown as OrganizationHealthConfig}
          updateConfig={updateConfig}
        />
      );
    case 'team-status':
      return (
        <TeamStatusConfigFields
          config={config as unknown as TeamStatusConfig}
          updateConfig={updateConfig}
        />
      );
    default:
      return <p className="text-sm text-muted-foreground">{DIALOG_TEXT.NO_CONFIG_MESSAGE}</p>;
  }
}
