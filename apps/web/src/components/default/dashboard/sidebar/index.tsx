'use client';

import type * as React from 'react';
import { Main } from '@/components/default/dashboard/navigation/main';
import { SkyllSwitcher } from '@/components/default/dashboard/sidebar/skyll-switcher';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { company } from '@/config/agency';
import { sidebarNavigationWithIcons } from '@/config/navigation-with-icons';

export function DefaultSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SkyllSwitcher teams={company.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarNavigationWithIcons.map((group) => (
          <Main key={group.title} items={group.items} groupLabel={group.title} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
