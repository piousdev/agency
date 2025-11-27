'use client';

import { Main } from '@/components/default/dashboard/navigation/main';
import { SkyllSwitcher } from '@/components/default/dashboard/sidebar/skyll-switcher';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { company } from '@/config/agency';
import { sidebarNavigationWithIcons } from '@/config/navigation-with-icons';

import type * as React from 'react';

// Define a type for collapsible prop for clarity

/**
 * Renders the default sidebar for the dashboard, including navigation groups and a team switcher.
 *
 * @param props - Props forwarded to the Sidebar component. See {@link Sidebar} for available props.
 */
export function DefaultSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} data-testid="sidebar__main">
      <SidebarHeader data-testid="sidebar__header">
        <SkyllSwitcher teams={company.teams} data-testid="sidebar__switcher" />
      </SidebarHeader>
      <SidebarContent data-testid="sidebar__content">
        {sidebarNavigationWithIcons.map((group) => (
          <Main
            key={group.title}
            items={group.items}
            groupLabel={group.title}
            data-testid="sidebar__main-group"
          />
        ))}
      </SidebarContent>
      <SidebarRail data-testid="sidebar__rail" />
    </Sidebar>
  );
}
