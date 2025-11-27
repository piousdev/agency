'use client';

import React from 'react';

import MenuContent from '@/components/default/dashboard/sidebar/skyll-switcher/components/menu-content';
import MenuTrigger from '@/components/default/dashboard/sidebar/skyll-switcher/components/menu-trigger';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

import type { ActiveTeam } from '@/components/default/dashboard/sidebar/skyll-switcher/types';

interface SkyllSwitcherProps {
  teams: readonly ActiveTeam[];
}

export function SkyllSwitcher({ teams }: SkyllSwitcherProps) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState<ActiveTeam | undefined>(
    teams.length > 0 ? teams[0] : undefined
  );

  React.useEffect(() => {
    setActiveTeam(teams.length > 0 ? teams[0] : undefined);
  }, [teams]);

  if (!activeTeam) return null;

  return (
    <SidebarMenu data-testid="sidebar__menu">
      <SidebarMenuItem data-testid="sidebar__menu-item">
        <DropdownMenu data-testid="sidebar__dropdown-menu">
          <MenuTrigger activeTeam={activeTeam} data-testid="sidebar__menu-trigger" />
          <MenuContent
            teams={teams}
            isMobile={isMobile}
            setActiveTeam={setActiveTeam}
            data-testid="sidebar__menu-content"
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
