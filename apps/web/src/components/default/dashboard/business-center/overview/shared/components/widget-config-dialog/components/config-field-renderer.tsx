// components/widget-config-dialog/config-field-renderer.tsx
import { DIALOG_TEXT } from '@/components/default/dashboard/business-center/overview/shared/components/widget-config-dialog/constants';

import { CurrentSprintConfigFields } from './current-sprint-config';
import { MyWorkTodayConfigFields } from './my-work-today-config';
import { OrganizationHealthConfigFields } from './organization-health-config';
import { RecentActivityConfigFields } from './recent-activity-config';
import { TeamStatusConfigFields } from './team-status-config';
import { UpcomingDeadlinesConfigFields } from './upcoming-deadlines-config';

import type {
  MyWorkTodayConfig,
  RecentActivityConfig,
  UpcomingDeadlinesConfig,
  CurrentSprintConfig,
  OrganizationHealthConfig,
  TeamStatusConfig,
} from '@/lib/stores/dashboard-store';
import type { ReactNode } from 'react';

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
      return (
        <p
          className="text-sm text-muted-foreground"
          aria-label="No config message"
          data-testid="no-config-message"
        >
          {DIALOG_TEXT.NO_CONFIG_MESSAGE}
        </p>
      );
  }
}
