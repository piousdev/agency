import Image from 'next/image';

import { IconSelector } from '@tabler/icons-react';

import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';

import type { ActiveTeam } from '@/components/default/dashboard/sidebar/skyll-switcher/types';

interface MenuTriggerProps {
  readonly activeTeam: ActiveTeam;
}

export default function MenuTrigger({ activeTeam }: MenuTriggerProps) {
  const menuButtonClassName =
    'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground';

  return (
    <DropdownMenuTrigger asChild data-testid="sidebar__menu-trigger">
      <SidebarMenuButton
        size="lg"
        className={menuButtonClassName}
        data-testid="sidebar__menu-trigger-button"
      >
        <div
          className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
          data-testid="sidebar__menu-trigger-icon-container"
        >
          {typeof activeTeam.logo === 'string' ? (
            <Image
              src={activeTeam.logo}
              alt={`${activeTeam.name} logo`}
              width={16}
              height={16}
              className="size-4"
              data-testid="sidebar__menu-trigger-icon-image"
            />
          ) : (
            <span
              className="size-4 flex items-center justify-center"
              data-testid="sidebar__menu-trigger-icon-fallback"
            >
              {activeTeam.name.charAt(0)}
            </span>
          )}
        </div>
        <div
          className="grid flex-1 text-left text-sm leading-tight"
          data-testid="sidebar__menu-trigger-text-container"
        >
          <span className="truncate font-medium" data-testid="sidebar__menu-trigger-text-name">
            {activeTeam.name}
          </span>
          <span className="truncate text-xs" data-testid="sidebar__menu-trigger-text-plan">
            {activeTeam.plan}
          </span>
        </div>
        <IconSelector className="ml-auto" data-testid="sidebar__menu-trigger-icon" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  );
}
