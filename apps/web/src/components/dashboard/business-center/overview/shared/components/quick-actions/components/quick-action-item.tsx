// components/quick-actions/quick-action-item.tsx
import Link from 'next/link';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { QuickAction } from '@/components/dashboard/business-center/overview/shared/components/quick-actions/types';
import { ICON_CLASSES } from '@/components/dashboard/business-center/overview/shared/components/quick-actions/constants';

type QuickActionItemProps = Readonly<{
  action: QuickAction;
}>;

export function QuickActionItem({ action }: QuickActionItemProps) {
  const Icon = action.icon;

  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <Link href={action.href}>
        <Icon className={ICON_CLASSES.MENU_ITEM} />
        {action.label}
      </Link>
    </DropdownMenuItem>
  );
}
