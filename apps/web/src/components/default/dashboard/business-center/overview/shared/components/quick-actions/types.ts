import type { Permission } from '@/lib/auth/permissions-constants';
import type { ComponentType } from 'react';

export type QuickActionVariant = 'default' | 'secondary' | 'outline';

export type QuickAction = Readonly<{
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  variant?: QuickActionVariant;
  requiredPermission?: Permission;
  shortcut?: string;
}>;

export type QuickActionsProps = Readonly<{
  className?: string;
}>;
