import {
  IconMessage,
  IconFileUpload,
  IconCheck,
  IconEdit,
  IconUserPlus,
  IconFolder,
  IconPlus,
  IconTrash,
  IconUser,
  IconActivity,
} from '@tabler/icons-react';
import type {
  KnownActivityType,
  FilterCategory,
  ActivityTypeConfig,
} from '@/components/dashboard/business-center/overview/types';

export const ACTIVITY_TYPE_CONFIG: Readonly<Record<KnownActivityType, ActivityTypeConfig>> = {
  comment_added: {
    icon: IconMessage,
    colorClass: 'bg-primary/10 text-primary',
  },
  file_uploaded: {
    icon: IconFileUpload,
    colorClass: 'bg-accent/10 text-accent-foreground',
  },
  task_completed: {
    icon: IconCheck,
    colorClass: 'bg-success/10 text-success',
  },
  task_updated: {
    icon: IconEdit,
    colorClass: 'bg-warning/10 text-warning',
  },
  member_joined: {
    icon: IconUserPlus,
    colorClass: 'bg-primary/10 text-primary',
  },
  project_created: {
    icon: IconFolder,
    colorClass: 'bg-accent/10 text-accent-foreground',
  },
  project_updated: {
    icon: IconEdit,
    colorClass: 'bg-warning/10 text-warning',
  },
  ticket_created: {
    icon: IconPlus,
    colorClass: 'bg-success/10 text-success',
  },
  ticket_updated: {
    icon: IconEdit,
    colorClass: 'bg-warning/10 text-warning',
  },
  ticket_assigned: {
    icon: IconUser,
    colorClass: 'bg-primary/10 text-primary',
  },
  ticket_deleted: {
    icon: IconTrash,
    colorClass: 'bg-destructive/10 text-destructive',
  },
  client_created: {
    icon: IconUserPlus,
    colorClass: 'bg-success/10 text-success',
  },
  client_updated: {
    icon: IconEdit,
    colorClass: 'bg-warning/10 text-warning',
  },
} as const;

export const FALLBACK_ACTIVITY_CONFIG: ActivityTypeConfig = {
  icon: IconActivity,
  colorClass: 'bg-muted text-muted-foreground',
} as const;

export const CATEGORY_TYPE_MAPPING: Readonly<
  Record<Exclude<FilterCategory, 'all'>, readonly KnownActivityType[]>
> = {
  tickets: [
    'ticket_created',
    'ticket_updated',
    'ticket_assigned',
    'ticket_deleted',
    'task_completed',
    'task_updated',
  ],
  projects: ['project_created', 'project_updated', 'member_joined'],
  clients: ['client_created', 'client_updated'],
  files: ['file_uploaded'],
  comments: ['comment_added'],
} as const;

export const FILTER_OPTIONS: readonly {
  readonly value: FilterCategory;
  readonly label: string;
}[] = [
  { value: 'all', label: 'All Activity' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'projects', label: 'Projects' },
  { value: 'clients', label: 'Clients' },
  { value: 'files', label: 'Files' },
  { value: 'comments', label: 'Comments' },
] as const;
