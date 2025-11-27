'use client';

import { NavigationMenuItem } from '@/components/default/dashboard/navigation/components/navigation-menu-item';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, useSidebar } from '@/components/ui/sidebar';

import type { NavigationItem } from '@/config/navigation';

interface MainProps {
  readonly items: readonly NavigationItem[];
  readonly groupLabel?: string;
}

/**
 * Main navigation component that renders a sidebar group with navigation items.
 * Single responsibility: Orchestrate the rendering of a navigation group.
 *
 * This component follows the Single Responsibility Principle by:
 * - Delegating sidebar context access to useSidebar hook
 * - Delegating item type selection to NavigationMenuItem factory
 * - Delegating specific item rendering to focused sub-components
 * - Only handling the group-level structure and iteration
 */
export function Main({ items, groupLabel }: MainProps) {
  const { state, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <NavigationMenuItem
            key={item.title}
            item={item}
            sidebarState={state}
            isMobile={isMobile}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
