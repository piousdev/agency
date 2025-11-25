// constants/widget-config-dialog.constants.ts
import type { DeadlineType } from '@/components/dashboard/business-center/overview/shared/components/widget-config-dialog/types';

export const PRIORITY_FILTERS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent Only' },
  { value: 'high', label: 'High & Above' },
  { value: 'medium', label: 'Medium & Above' },
  { value: 'low', label: 'Low & Above' },
] as const;

export const ACTIVITY_FILTERS = [
  { value: 'all', label: 'All Activity' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'projects', label: 'Projects' },
  { value: 'clients', label: 'Clients' },
  { value: 'files', label: 'Files' },
  { value: 'comments', label: 'Comments' },
] as const;

export const DEADLINE_TYPES: ReadonlyArray<{ value: DeadlineType; label: string }> = [
  { value: 'task', label: 'Tasks' },
  { value: 'project', label: 'Projects' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'invoice', label: 'Invoices' },
] as const;

export const SLIDER_CONFIGS = {
  MAX_ITEMS: {
    MIN: 5,
    MAX: 25,
    STEP: 1,
  },
  DAYS_AHEAD: {
    MIN: 7,
    MAX: 30,
    STEP: 1,
  },
} as const;

export const DIALOG_TEXT = {
  TITLE_PREFIX: 'Configure',
  DESCRIPTION: 'Customize how this widget displays information.',
  NO_CONFIG_MESSAGE: 'No configuration options available for this widget.',
  RESET_BUTTON: 'Reset to Default',
  SAVE_BUTTON: 'Save Changes',
} as const;
