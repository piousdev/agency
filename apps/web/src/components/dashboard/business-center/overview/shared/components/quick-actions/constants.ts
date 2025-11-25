import {
  IconFolder,
  IconFileText,
  IconUsers,
  IconInbox,
  IconCalendar,
  IconMessage,
} from '@tabler/icons-react';
import type { QuickAction } from '@/components/dashboard/business-center/overview/shared/components/quick-actions/types';

export const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: IconFolder,
    href: '/dashboard/business-center/projects/new',
    variant: 'default',
    requiredPermission: 'project:create',
    shortcut: 'p',
  },
  {
    id: 'new-ticket',
    label: 'New Ticket',
    icon: IconFileText,
    href: '/dashboard/business-center/intake-queue/new',
    variant: 'secondary',
    requiredPermission: 'ticket:create',
    shortcut: 't',
  },
  {
    id: 'new-client',
    label: 'New Client',
    icon: IconUsers,
    href: '/dashboard/business-center/clients/new',
    variant: 'secondary',
    requiredPermission: 'client:create',
    shortcut: 'c',
  },
  {
    id: 'view-intake',
    label: 'Intake Queue',
    icon: IconInbox,
    href: '/dashboard/business-center/intake-queue',
    variant: 'outline',
    requiredPermission: 'ticket:view',
    shortcut: 'i',
  },
  {
    id: 'view-calendar',
    label: 'Calendar',
    icon: IconCalendar,
    href: '/dashboard/projects/views/calendar',
    variant: 'outline',
    requiredPermission: 'project:view',
    shortcut: 'a',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: IconMessage,
    href: '/dashboard/collaboration/messages',
    variant: 'outline',
    shortcut: 'm',
  },
] as const;

export const MENU_LABELS = {
  QUICK_ACTIONS: 'Quick Actions',
  CUSTOMIZE_WIDGETS: 'Customize Widgets',
  OPEN_MENU: 'Open menu',
  SR_ONLY: 'Quick Actions',
} as const;

export const MENU_CONFIG = {
  WIDTH: 'w-50',
  ALIGN: 'end',
} as const;

export const TRIGGER_BUTTON_CLASSES =
  'cursor-pointer hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-sm hover:shadow-secondary/20 transition-all hover:border hover:border-border border border-dashed' as const;

export const ICON_CLASSES = {
  TRIGGER: 'size-4',
  MENU_ITEM: 'size-4 mr-2',
} as const;
