'use client';

import { useSearchTrigger } from '@/components/default/dashboard/navigation/hooks/use-search-trigger';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import type { NavigationItem } from '@/config/navigation';

interface SearchTriggerMenuItemProps {
  item: NavigationItem;
}

/**
 * Renders a menu item that triggers the command palette/search.
 * Single responsibility: Display and handle search trigger interaction.
 */
export function SearchTriggerMenuItem({ item }: SearchTriggerMenuItemProps) {
  const { triggerSearch } = useSearchTrigger();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} onClick={triggerSearch}>
        {item.icon && <item.icon />}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
