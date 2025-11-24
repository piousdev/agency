'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useDashboardStore,
  type MyWorkTodayConfig,
  type RecentActivityConfig,
  type UpcomingDeadlinesConfig,
  type CurrentSprintConfig,
  type OrganizationHealthConfig,
  type TeamStatusConfig,
  DEFAULT_WIDGET_CONFIGS,
} from '@/lib/stores/dashboard-store';

interface WidgetConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId: string;
  widgetType: string;
  widgetTitle: string;
}

export function WidgetConfigDialog({
  open,
  onOpenChange,
  widgetId,
  widgetType,
  widgetTitle,
}: WidgetConfigDialogProps) {
  const { getWidgetConfig, setWidgetConfig } = useDashboardStore();
  const currentConfig = getWidgetConfig(widgetId, widgetType);
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(currentConfig);

  const handleSave = () => {
    setWidgetConfig(widgetId, localConfig);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType] || {};
    setLocalConfig(defaultConfig);
  };

  const updateConfig = (key: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const renderConfigFields = () => {
    switch (widgetType) {
      case 'my-work-today':
        return (
          <MyWorkTodayConfigFields
            config={localConfig as unknown as MyWorkTodayConfig}
            updateConfig={updateConfig}
          />
        );
      case 'recent-activity':
        return (
          <RecentActivityConfigFields
            config={localConfig as unknown as RecentActivityConfig}
            updateConfig={updateConfig}
          />
        );
      case 'upcoming-deadlines':
        return (
          <UpcomingDeadlinesConfigFields
            config={localConfig as unknown as UpcomingDeadlinesConfig}
            updateConfig={updateConfig}
          />
        );
      case 'current-sprint':
        return (
          <CurrentSprintConfigFields
            config={localConfig as unknown as CurrentSprintConfig}
            updateConfig={updateConfig}
          />
        );
      case 'organization-health':
        return (
          <OrganizationHealthConfigFields
            config={localConfig as unknown as OrganizationHealthConfig}
            updateConfig={updateConfig}
          />
        );
      case 'team-status':
        return (
          <TeamStatusConfigFields
            config={localConfig as unknown as TeamStatusConfig}
            updateConfig={updateConfig}
          />
        );
      default:
        return (
          <p className="text-sm text-muted-foreground">
            No configuration options available for this widget.
          </p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure {widgetTitle}</DialogTitle>
          <DialogDescription>Customize how this widget displays information.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">{renderConfigFields()}</div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// My Work Today configuration fields
function MyWorkTodayConfigFields({
  config,
  updateConfig,
}: {
  config: MyWorkTodayConfig;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="showCompleted">Show Completed Tasks</Label>
        <Switch
          id="showCompleted"
          checked={config.showCompleted}
          onCheckedChange={(checked) => updateConfig('showCompleted', checked)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priorityFilter">Priority Filter</Label>
        <Select
          value={config.priorityFilter}
          onValueChange={(value) => updateConfig('priorityFilter', value)}
        >
          <SelectTrigger id="priorityFilter">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent Only</SelectItem>
            <SelectItem value="high">High & Above</SelectItem>
            <SelectItem value="medium">Medium & Above</SelectItem>
            <SelectItem value="low">Low & Above</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Max Items: {config.maxItems}</Label>
        <Slider
          value={[config.maxItems]}
          onValueChange={([value]) => updateConfig('maxItems', value)}
          min={5}
          max={25}
          step={1}
        />
      </div>
    </>
  );
}

// Recent Activity configuration fields
function RecentActivityConfigFields({
  config,
  updateConfig,
}: {
  config: RecentActivityConfig;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="filterCategory">Default Filter</Label>
        <Select
          value={config.filterCategory}
          onValueChange={(value) => updateConfig('filterCategory', value)}
        >
          <SelectTrigger id="filterCategory">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="tickets">Tickets</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="clients">Clients</SelectItem>
            <SelectItem value="files">Files</SelectItem>
            <SelectItem value="comments">Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Max Items: {config.maxItems}</Label>
        <Slider
          value={[config.maxItems]}
          onValueChange={([value]) => updateConfig('maxItems', value)}
          min={5}
          max={25}
          step={1}
        />
      </div>
    </>
  );
}

// Upcoming Deadlines configuration fields
function UpcomingDeadlinesConfigFields({
  config,
  updateConfig,
}: {
  config: UpcomingDeadlinesConfig;
  updateConfig: (key: string, value: unknown) => void;
}) {
  const deadlineTypeOptions = [
    { value: 'task', label: 'Tasks' },
    { value: 'project', label: 'Projects' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'invoice', label: 'Invoices' },
  ];

  const toggleDeadlineType = (type: string) => {
    const current = config.deadlineTypes || [];
    if (current.includes(type as 'task' | 'project' | 'milestone' | 'meeting' | 'invoice')) {
      updateConfig(
        'deadlineTypes',
        current.filter((t) => t !== type)
      );
    } else {
      updateConfig('deadlineTypes', [...current, type]);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Days Ahead: {config.daysAhead}</Label>
        <Slider
          value={[config.daysAhead]}
          onValueChange={([value]) => updateConfig('daysAhead', value)}
          min={7}
          max={30}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <Label>Deadline Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {deadlineTypeOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`deadline-${option.value}`}
                checked={config.deadlineTypes?.includes(
                  option.value as 'task' | 'project' | 'milestone' | 'meeting' | 'invoice'
                )}
                onCheckedChange={() => toggleDeadlineType(option.value)}
              />
              <Label htmlFor={`deadline-${option.value}`} className="text-sm font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Current Sprint configuration fields
function CurrentSprintConfigFields({
  config,
  updateConfig,
}: {
  config: CurrentSprintConfig;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="showBurndown">Show Burndown Chart</Label>
        <Switch
          id="showBurndown"
          checked={config.showBurndown}
          onCheckedChange={(checked) => updateConfig('showBurndown', checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="showVelocity">Show Velocity Comparison</Label>
        <Switch
          id="showVelocity"
          checked={config.showVelocity}
          onCheckedChange={(checked) => updateConfig('showVelocity', checked)}
        />
      </div>
    </>
  );
}

// Organization Health configuration fields
function OrganizationHealthConfigFields({
  config,
  updateConfig,
}: {
  config: OrganizationHealthConfig;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="showTrends">Show Trend Indicators</Label>
      <Switch
        id="showTrends"
        checked={config.showTrends}
        onCheckedChange={(checked) => updateConfig('showTrends', checked)}
      />
    </div>
  );
}

// Team Status configuration fields
function TeamStatusConfigFields({
  config,
  updateConfig,
}: {
  config: TeamStatusConfig;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="showUtilization">Show Utilization Bars</Label>
      <Switch
        id="showUtilization"
        checked={config.showUtilization}
        onCheckedChange={(checked) => updateConfig('showUtilization', checked)}
      />
    </div>
  );
}
