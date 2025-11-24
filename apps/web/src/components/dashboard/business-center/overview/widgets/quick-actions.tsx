'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IconPlus,
  IconInbox,
  IconFolder,
  IconUsers,
  IconFileText,
  IconCalendar,
  IconMessage,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { usePermissions, type Permission } from '@/lib/hooks/use-permissions';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: 'default' | 'secondary' | 'outline';
  description?: string;
  requiredPermission?: Permission;
  shortcut?: string; // e.g., 'p' for Alt+P
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: IconFolder,
    href: '/dashboard/business-center/projects/new',
    variant: 'default',
    description: 'Create a new project',
    requiredPermission: 'project:create',
    shortcut: 'p',
  },
  {
    id: 'new-ticket',
    label: 'New Ticket',
    icon: IconFileText,
    href: '/dashboard/business-center/intake-queue/new',
    variant: 'secondary',
    description: 'Create a new intake ticket',
    requiredPermission: 'ticket:create',
    shortcut: 't',
  },
  {
    id: 'new-client',
    label: 'New Client',
    icon: IconUsers,
    href: '/dashboard/business-center/clients/new',
    variant: 'secondary',
    description: 'Add a new client',
    requiredPermission: 'client:create',
    shortcut: 'c',
  },
  {
    id: 'view-intake',
    label: 'Intake Queue',
    icon: IconInbox,
    href: '/dashboard/business-center/intake-queue',
    variant: 'outline',
    description: 'View pending requests',
    requiredPermission: 'ticket:view',
    shortcut: 'i',
  },
  {
    id: 'view-calendar',
    label: 'Calendar',
    icon: IconCalendar,
    href: '/dashboard/projects/views/calendar',
    variant: 'outline',
    description: 'View project calendar',
    requiredPermission: 'project:view',
    shortcut: 'a',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: IconMessage,
    href: '/dashboard/collaboration/messages',
    variant: 'outline',
    description: 'View messages',
    shortcut: 'm',
  },
];

export interface QuickActionsWidgetProps {
  className?: string;
}

export function QuickActionsWidget({ className }: QuickActionsWidgetProps) {
  const { can, isLoading } = usePermissions();
  const router = useRouter();

  // Filter actions based on permissions
  const visibleActions = QUICK_ACTIONS.filter(
    (action) => !action.requiredPermission || can(action.requiredPermission)
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Alt + key for shortcuts
      if (!e.altKey) return;

      const action = visibleActions.find((a) => a.shortcut?.toLowerCase() === e.key.toLowerCase());

      if (action) {
        e.preventDefault();
        toast.info(`Navigating to ${action.label}`, {
          description: action.description,
          duration: 2000,
        });
        router.push(action.href);
      }
    },
    [visibleActions, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClick = (action: QuickAction) => {
    toast.info(`Opening ${action.label}`, {
      description: action.description,
      duration: 1500,
    });
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleActions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || 'outline'}
          size="sm"
          asChild
          className="gap-2"
          title={
            action.shortcut
              ? `${action.label} (Alt+${action.shortcut.toUpperCase()})`
              : action.label
          }
          onClick={() => handleClick(action)}
        >
          <Link href={action.href}>
            <action.icon className="h-4 w-4" />
            {action.label}
            {action.shortcut && (
              <kbd className="hidden sm:inline-flex ml-1 text-xs opacity-50">
                Alt+{action.shortcut.toUpperCase()}
              </kbd>
            )}
          </Link>
        </Button>
      ))}
    </div>
  );
}

/**
 * Compact version with just icons for smaller screens
 */
export function QuickActionsCompact({ className }: QuickActionsWidgetProps) {
  const { can } = usePermissions();

  const visibleActions = QUICK_ACTIONS.filter(
    (action) => !action.requiredPermission || can(action.requiredPermission)
  );

  return (
    <div className={cn('flex gap-1', className)}>
      {visibleActions.slice(0, 4).map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9"
          title={
            action.shortcut
              ? `${action.label} (Alt+${action.shortcut.toUpperCase()})`
              : action.label
          }
        >
          <Link href={action.href}>
            <action.icon className="h-4 w-4" />
            <span className="sr-only">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}

/**
 * Grid layout version for larger widgets
 */
export function QuickActionsGrid({ className }: QuickActionsWidgetProps) {
  const { can } = usePermissions();
  const router = useRouter();

  const visibleActions = QUICK_ACTIONS.filter(
    (action) => !action.requiredPermission || can(action.requiredPermission)
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.altKey) return;

      const action = visibleActions.find((a) => a.shortcut?.toLowerCase() === e.key.toLowerCase());

      if (action) {
        e.preventDefault();
        toast.info(`Navigating to ${action.label}`, {
          description: action.description,
          duration: 2000,
        });
        router.push(action.href);
      }
    },
    [visibleActions, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClick = (action: QuickAction) => {
    toast.info(`Opening ${action.label}`, {
      description: action.description,
      duration: 1500,
    });
  };

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3', className)}>
      {visibleActions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          onClick={() => handleClick(action)}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-center group"
          title={
            action.shortcut
              ? `${action.label} (Alt+${action.shortcut.toUpperCase()})`
              : action.label
          }
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <action.icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium">{action.label}</span>
          {action.shortcut && (
            <kbd className="hidden sm:block text-[10px] text-muted-foreground opacity-50">
              Alt+{action.shortcut.toUpperCase()}
            </kbd>
          )}
        </Link>
      ))}
    </div>
  );
}
